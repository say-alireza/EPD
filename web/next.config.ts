import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "epd"; // GitHub repo name

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

