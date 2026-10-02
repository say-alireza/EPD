import urllib.request
import re
import json
import time
from html import unescape

proxy_support = urllib.request.ProxyHandler({
    'http': 'socks5://127.0.0.1:10808',
    'https': 'socks5://127.0.0.1:10808'
})
opener = urllib.request.build_opener(proxy_support)

def clean_html(raw):
    t = re.sub(r'<br\s*/?>', '\n', raw)
    t = re.sub(r'<[^>]+>', '', t)
    return unescape(t).strip()

def fetch_page(before=None):
    url = 'https://t.me/s/EPDCommunity'
    if before:
        url += f'?before={before}'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        return opener.open(req, timeout=20).read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def parse_posts_from_html(html):
    posts_data = {}
    # Find all post ids in order
    post_ids = re.findall(r'data-post="EPDCommunity/(\d+)"', html)
    for pid in set(post_ids):
        # find matching widget message block
        pattern = r'<div class="tgme_widget_message[^\"]*"[^>]*data-post="EPDCommunity/' + pid + r'".*?(?=<div class="tgme_widget_message[^\"]*"[^>]*data-post="EPDCommunity/|\Z)'
        match = re.search(pattern, html, re.DOTALL)
        if not match:
            continue
        block = match.group(0)
        
        # text
        t_match = re.search(r'<div class="tgme_widget_message_text[^\"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
        text = clean_html(t_match.group(1)) if t_match else ""
        
        # photos (background-image:url('...'))
        raw_photos = re.findall(r"background-image:url\('([^']+)'\)", block)
        photos = [p for p in raw_photos if not p.startswith('//telegram.org/img/emoji')]
        
        # time
        time_m = re.search(r'<time datetime="([^"]+)"', block)
        iso_time = time_m.group(1) if time_m else ""

        posts_data[int(pid)] = {
            "id": int(pid),
            "iso_time": iso_time,
            "text": text,
            "photos": photos,
        }
    return posts_data

def scrape_all():
    all_posts = {}
    
    # 1. Fetch latest page
    print("Fetching latest page...")
    html = fetch_page()
    page_posts = parse_posts_from_html(html)
    all_posts.update(page_posts)
    print(f"Found {len(page_posts)} posts on latest page. IDs: {sorted(all_posts.keys())}")
    
    min_id = min(all_posts.keys()) if all_posts else 200
    
    while min_id > 1:
        print(f"Fetching posts before {min_id}...")
        html = fetch_page(before=min_id)
        page_posts = parse_posts_from_html(html)
        if not page_posts:
            print("No posts returned, breaking.")
            break
            
        new_ids = [k for k in page_posts.keys() if k not in all_posts]
        all_posts.update(page_posts)
        print(f"Added {len(new_ids)} new posts. Current min_id: {min(all_posts.keys())}, total: {len(all_posts)}")
        
        lowest_in_batch = min(page_posts.keys())
        if lowest_in_batch >= min_id:
            # could not go further backwards
            print("Reached bottom or no progress.")
            break
        min_id = lowest_in_batch
        time.sleep(0.5)

    sorted_posts = [all_posts[k] for k in sorted(all_posts.keys())]
    output_path = "C:/Users/Alireza/Desktop/my projects/epd/scripts/channel_all_posts.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(sorted_posts, f, ensure_ascii=False, indent=2)
        
    print(f"\nFinished scraping! Total posts saved: {len(sorted_posts)} to {output_path}")

if __name__ == "__main__":
    scrape_all()
