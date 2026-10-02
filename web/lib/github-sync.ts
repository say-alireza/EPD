/**
 * GitHub Sync Module for EPD
 * Commits posters, session metadata, and gallery photos directly to the GitHub repository.
 * Triggers automatic Cloudflare Pages deployment with permanent, unblocked media.
 */

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN || "";
  const repo = process.env.GITHUB_REPO || "say-alireza/EPD";
  const branch = process.env.GITHUB_BRANCH || "main";
  return { token, repo, branch };
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function githubRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const { token, repo } = getGitHubConfig();
  if (!token) {
    throw new Error(
      "متغیر GITHUB_TOKEN در کلودفلر یا سیستم تنظیم نشده است. لطفاً توکن گیت‌هاب را وارد کنید."
    );
  }

  const url = `https://api.github.com/repos/${repo}${endpoint}`;
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "EPD-Telegram-Bot",
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API Error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

function decodeBase64Utf8(base64: string): string {
  const binaryString = atob(base64.replace(/[\n\r\s]/g, ""));
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function fetchFileFromRepo(path: string, branch: string): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await githubRequest<{ content: string; sha: string; encoding: string }>(
      `/contents/${path}?ref=${branch}`
    );
    const decoded = decodeBase64Utf8(res.content);
    return { content: decoded, sha: res.sha };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export interface SessionPosterSyncOptions {
  sessionNumber: number;
  topicEn: string;
  topicFa?: string;
  dateFa: string;
  imageBuffer: ArrayBuffer;
  venueFa?: string;
  timeFa?: string;
  feeTomans?: number;
  feeFa?: string;
}

export async function syncPosterToGitHub(options: SessionPosterSyncOptions): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();

  // 1. Get latest commit SHA on main
  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  // 2. Upload image blob
  const imageBase64 = toBase64(options.imageBuffer);
  const imageBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: imageBase64,
      encoding: "base64",
    },
  });

  // Target image path
  const imageRepoPath = `web/public/media/posters/poster-epd${options.sessionNumber}.jpg`;
  const imagePublicUrl = `/media/posters/poster-epd${options.sessionNumber}.jpg`;

  // 3. Update next-session.json
  const nextSessionFile = await fetchFileFromRepo("web/data/next-session.json", branch);
  let nextSessionData: Record<string, unknown> = {};
  if (nextSessionFile) {
    try {
      nextSessionData = JSON.parse(nextSessionFile.content);
    } catch {
      nextSessionData = {};
    }
  }

  nextSessionData = {
    ...nextSessionData,
    number: options.sessionNumber,
    topicEn: options.topicEn,
    topicFa: options.topicFa || nextSessionData.topicFa || "موضوع جلسه به زودی اعلام می‌شود",
    posterImage: imagePublicUrl,
    timeFa: options.timeFa || nextSessionData.timeFa || "۱۰:۰۰ تا ۱۲:۰۰",
    venueFa: options.venueFa || nextSessionData.venueFa || "مشهد، بلوار احمدآباد، کافه کتاب آفتاب",
    feeTomans: options.feeTomans !== undefined ? options.feeTomans : (typeof nextSessionData.feeTomans === "number" ? nextSessionData.feeTomans : 50000),
    feeFa: options.feeFa || (typeof nextSessionData.feeFa === "string" ? nextSessionData.feeFa : "۵۰,۰۰۰ تومان"),
  };

  const nextSessionBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(nextSessionData, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  // 4. Update posters.json (Archive)
  const postersFile = await fetchFileFromRepo("web/data/posters.json", branch);
  let postersArray: Array<{
    id: string;
    sessionNumber: number;
    topicEn: string;
    dateFa: string;
    image: string;
  }> = [];

  if (postersFile) {
    try {
      postersArray = JSON.parse(postersFile.content);
    } catch {
      postersArray = [];
    }
  }

  // Filter out any existing item for this session, then prepend the new one
  postersArray = postersArray.filter((p) => p.sessionNumber !== options.sessionNumber);
  postersArray.unshift({
    id: `poster-${options.sessionNumber}`,
    sessionNumber: options.sessionNumber,
    topicEn: options.topicEn,
    dateFa: options.dateFa,
    image: imagePublicUrl,
  });

  const postersBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(postersArray, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  // 5. Create new Git Tree
  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: [
        {
          path: imageRepoPath,
          mode: "100644",
          type: "blob",
          sha: imageBlob.sha,
        },
        {
          path: "web/data/next-session.json",
          mode: "100644",
          type: "blob",
          sha: nextSessionBlob.sha,
        },
        {
          path: "web/data/posters.json",
          mode: "100644",
          type: "blob",
          sha: postersBlob.sha,
        },
      ],
    },
  });

  // 6. Create Commit
  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: `feat(session): publish poster and details for session ${options.sessionNumber}`,
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  // 7. Update branch ref
  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}

export interface GalleryPhotoSyncOptions {
  sessionNumber: number;
  imageBuffer: ArrayBuffer;
}

export async function syncGalleryPhotoToGitHub(options: GalleryPhotoSyncOptions): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();

  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  const timestamp = Date.now();
  const imageRepoPath = `web/public/media/gallery/gallery-epd${options.sessionNumber}-${timestamp}.jpg`;
  const imagePublicUrl = `/media/gallery/gallery-epd${options.sessionNumber}-${timestamp}.jpg`;

  const imageBase64 = toBase64(options.imageBuffer);
  const imageBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: imageBase64,
      encoding: "base64",
    },
  });

  // Update gallery.json
  const galleryFile = await fetchFileFromRepo("web/data/gallery.json", branch);
  let galleryArray: Array<{
    id: string;
    sessionNumber: number;
    image: string;
    caption?: string;
  }> = [];

  if (galleryFile) {
    try {
      galleryArray = JSON.parse(galleryFile.content);
    } catch {
      galleryArray = [];
    }
  }

  galleryArray.unshift({
    id: `gallery-${options.sessionNumber}-${timestamp}`,
    sessionNumber: options.sessionNumber,
    image: imagePublicUrl,
    caption: `نشست ${options.sessionNumber} جامعه EPD`,
  });

  const galleryBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(galleryArray, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: [
        {
          path: imageRepoPath,
          mode: "100644",
          type: "blob",
          sha: imageBlob.sha,
        },
        {
          path: "web/data/gallery.json",
          mode: "100644",
          type: "blob",
          sha: galleryBlob.sha,
        },
      ],
    },
  });

  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: `feat(gallery): add photo for session ${options.sessionNumber}`,
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}

export async function deletePosterFromGitHub(posterId: string): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();
  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  // 1. Read and update posters.json
  const postersFile = await fetchFileFromRepo("web/data/posters.json", branch);
  let postersArray: Array<{
    id: string;
    sessionNumber: number;
    topicEn: string;
    dateFa: string;
    image: string;
  }> = [];

  if (postersFile) {
    try {
      postersArray = JSON.parse(postersFile.content);
    } catch {
      postersArray = [];
    }
  }

  const targetPoster = postersArray.find((p) => p.id === posterId);
  postersArray = postersArray.filter((p) => p.id !== posterId);

  const postersBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(postersArray, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [
    {
      path: "web/data/posters.json",
      mode: "100644",
      type: "blob",
      sha: postersBlob.sha,
    },
  ];

  // 2. If targetPoster was in next-session.json, update next-session.json as well
  const nextSessionFile = await fetchFileFromRepo("web/data/next-session.json", branch);
  if (nextSessionFile) {
    try {
      const nextSessionData = JSON.parse(nextSessionFile.content);
      if (
        (targetPoster && nextSessionData.number === targetPoster.sessionNumber) ||
        (targetPoster && nextSessionData.posterImage === targetPoster.image)
      ) {
        // Fallback to top remaining poster, or null
        const topRemaining = postersArray[0];
        nextSessionData.posterImage = topRemaining ? topRemaining.image : null;
        if (topRemaining) {
          nextSessionData.number = topRemaining.sessionNumber;
          nextSessionData.topicEn = topRemaining.topicEn;
        }

        const nextSessionBlob = await githubRequest<{ sha: string }>("/git/blobs", {
          method: "POST",
          body: {
            content: encodeUtf8Base64(JSON.stringify(nextSessionData, null, 2) + "\n"),
            encoding: "base64",
          },
        });

        treeEntries.push({
          path: "web/data/next-session.json",
          mode: "100644",
          type: "blob",
          sha: nextSessionBlob.sha,
        });
      }
    } catch (e) {
      console.error("Error updating next-session.json on poster delete:", e);
    }
  }

  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: treeEntries,
    },
  });

  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: `chore(posters): delete poster ${posterId}`,
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}

export async function deleteGalleryFromGitHub(galleryId: string): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();
  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  const galleryFile = await fetchFileFromRepo("web/data/gallery.json", branch);
  let galleryArray: Array<{ id: string; sessionNumber: number; image: string; caption?: string }> = [];

  if (galleryFile) {
    try {
      galleryArray = JSON.parse(galleryFile.content);
    } catch {
      galleryArray = [];
    }
  }

  galleryArray = galleryArray.filter((g) => g.id !== galleryId);

  const galleryBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(galleryArray, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: [
        {
          path: "web/data/gallery.json",
          mode: "100644",
          type: "blob",
          sha: galleryBlob.sha,
        },
      ],
    },
  });

  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: `chore(gallery): delete gallery item ${galleryId}`,
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}

export async function syncSessionUpdateToGitHub(partialData: Record<string, unknown>): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();
  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  const nextSessionFile = await fetchFileFromRepo("web/data/next-session.json", branch);
  let nextSessionData: Record<string, unknown> = {};
  if (nextSessionFile) {
    try {
      nextSessionData = JSON.parse(nextSessionFile.content);
    } catch {
      nextSessionData = {};
    }
  }

  nextSessionData = {
    ...nextSessionData,
    ...partialData,
  };

  const nextSessionBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(nextSessionData, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: [
        {
          path: "web/data/next-session.json",
          mode: "100644",
          type: "blob",
          sha: nextSessionBlob.sha,
        },
      ],
    },
  });

  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: `chore(session): update session details`,
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}

export async function syncSlotsToGitHub(slots: unknown[]): Promise<{ commitSha: string; commitUrl: string }> {
  const { branch } = getGitHubConfig();
  const refData = await githubRequest<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const latestCommitSha = refData.object.sha;

  const slotsBlob = await githubRequest<{ sha: string }>("/git/blobs", {
    method: "POST",
    body: {
      content: encodeUtf8Base64(JSON.stringify(slots, null, 2) + "\n"),
      encoding: "base64",
    },
  });

  const treeData = await githubRequest<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: latestCommitSha,
      tree: [
        {
          path: "web/data/slots.json",
          mode: "100644",
          type: "blob",
          sha: slotsBlob.sha,
        },
      ],
    },
  });

  const commitData = await githubRequest<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: {
      message: "chore(slots): sync updated slots list",
      tree: treeData.sha,
      parents: [latestCommitSha],
    },
  });

  await githubRequest(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: commitData.sha,
    },
  });

  return {
    commitSha: commitData.sha,
    commitUrl: commitData.html_url || `https://github.com/${getGitHubConfig().repo}/commit/${commitData.sha}`,
  };
}
