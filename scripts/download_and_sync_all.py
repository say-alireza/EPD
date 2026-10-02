import os
import json
import urllib.request
import time

proxy_support = urllib.request.ProxyHandler({
    'http': 'socks5://127.0.0.1:10808',
    'https': 'socks5://127.0.0.1:10808'
})
opener = urllib.request.build_opener(proxy_support)

POSTERS_DIR = "C:/Users/Alireza/Desktop/my projects/epd/web/public/media/posters"
GALLERY_DIR = "C:/Users/Alireza/Desktop/my projects/epd/web/public/media/gallery"

os.makedirs(POSTERS_DIR, exist_ok=True)
os.makedirs(GALLERY_DIR, exist_ok=True)

def download_image(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 5000:
        return True
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        content = opener.open(req, timeout=30).read()
        if len(content) > 1000:
            with open(target_path, 'wb') as f:
                f.write(content)
            return True
        else:
            print(f"Warning: downloaded content too small ({len(content)} bytes) for {url}")
            return False
    except Exception as e:
        print(f"Error downloading {url} -> {target_path}: {e}")
        return False

# Mapping of all sessions based on channel posts analysis
# Posters definition
POSTERS_SPEC = [
    {
        "id": "poster-212",
        "sessionNumber": 212,
        "topicEn": "EPD Quest for Victory",
        "dateFa": "شنبه ۱۱ مهر ۱۴۰۵",
        "post_id": 191,
        "photo_idx": 0,
        "filename": "poster-epd212.jpg"
    },
    {
        "id": "poster-211",
        "sessionNumber": 211,
        "topicEn": "Main Character Energy",
        "dateFa": "پنج‌شنبه ۹ مهر ۱۴۰۵",
        "post_id": 189,
        "photo_idx": 0,
        "filename": "poster-epd211.jpg"
    },
    {
        "id": "poster-210",
        "sessionNumber": 210,
        "topicEn": "Racism & Society",
        "dateFa": "پنج‌شنبه ۲ مهر ۱۴۰۵",
        "post_id": 184,
        "photo_idx": 0,
        "filename": "poster-epd210.jpg"
    },
    {
        "id": "poster-209",
        "sessionNumber": 209,
        "topicEn": "EPD Quest for Victory",
        "dateFa": "یکشنبه ۲۹ شهریور ۱۴۰۵",
        "post_id": 179,
        "photo_idx": 0,
        "filename": "poster-epd209.jpg"
    },
    {
        "id": "poster-208",
        "sessionNumber": 208,
        "topicEn": "Crimes and Mysteries",
        "dateFa": "پنج‌شنبه ۲۶ شهریور ۱۴۰۵",
        "post_id": 176,
        "photo_idx": 0,
        "filename": "poster-epd208.jpg"
    },
    {
        "id": "poster-207",
        "sessionNumber": 207,
        "topicEn": "Imaginary Worlds",
        "dateFa": "پنج‌شنبه ۱۹ شهریور ۱۴۰۵",
        "post_id": 172,
        "photo_idx": 0,
        "filename": "poster-epd207.jpg"
    },
    {
        "id": "poster-206",
        "sessionNumber": 206,
        "topicEn": "Secrets and Lies",
        "dateFa": "پنج‌شنبه ۱۲ شهریور ۱۴۰۵",
        "post_id": 168,
        "photo_idx": 0,
        "filename": "poster-epd206.jpg"
    },
    {
        "id": "poster-205",
        "sessionNumber": 205,
        "topicEn": "Siblings and Family",
        "dateFa": "پنج‌شنبه ۵ شهریور ۱۴۰۵",
        "post_id": 162,
        "photo_idx": 0,
        "filename": "poster-epd205.jpg"
    },
    {
        "id": "poster-204",
        "sessionNumber": 204,
        "topicEn": "EPD Quest for Victory",
        "dateFa": "دوشنبه ۲ شهریور ۱۴۰۵",
        "post_id": 153,
        "photo_idx": 0,
        "filename": "poster-epd204.jpg"
    },
    {
        "id": "poster-203",
        "sessionNumber": 203,
        "topicEn": "Forgiveness (Deep Talk)",
        "dateFa": "پنج‌شنبه ۲۹ مرداد ۱۴۰۵",
        "post_id": 148,
        "photo_idx": 0,
        "filename": "poster-epd203.jpg"
    },
    {
        "id": "poster-202",
        "sessionNumber": 202,
        "topicEn": "Pop Culture",
        "dateFa": "پنج‌شنبه ۲۲ مرداد ۱۴۰۵",
        "post_id": 144,
        "photo_idx": 0,
        "filename": "poster-epd202.jpg"
    },
    {
        "id": "poster-201",
        "sessionNumber": 201,
        "topicEn": "EPD Quest for Victory",
        "dateFa": "سه‌شنبه ۲۰ مرداد ۱۴۰۵",
        "post_id": 142,
        "photo_idx": 0,
        "filename": "poster-epd201.jpg"
    },
    {
        "id": "poster-200",
        "sessionNumber": 200,
        "topicEn": "Childhood Memories",
        "dateFa": "پنج‌شنبه ۱۵ مرداد ۱۴۰۵",
        "post_id": 133,
        "photo_idx": 0,
        "filename": "poster-epd200.jpg"
    },
    {
        "id": "poster-199",
        "sessionNumber": 199,
        "topicEn": "Superstitions",
        "dateFa": "پنج‌شنبه ۸ مرداد ۱۴۰۵",
        "post_id": 122,
        "photo_idx": 0,
        "filename": "poster-epd199.jpg"
    },
    {
        "id": "poster-198",
        "sessionNumber": 198,
        "topicEn": "Green Flag",
        "dateFa": "پنج‌شنبه ۱ مرداد ۱۴۰۵",
        "post_id": 120,
        "photo_idx": 0,
        "filename": "poster-epd198.jpg"
    },
    {
        "id": "poster-197",
        "sessionNumber": 197,
        "topicEn": "The Perfect Day",
        "dateFa": "پنج‌شنبه ۲۵ تیر ۱۴۰۵",
        "post_id": 116,
        "photo_idx": 0,
        "filename": "poster-epd197.jpg"
    },
    {
        "id": "poster-196",
        "sessionNumber": 196,
        "topicEn": "The Brand Called You",
        "dateFa": "چهارشنبه ۱۷ تیر ۱۴۰۵",
        "post_id": 113,
        "photo_idx": 0,
        "filename": "poster-epd196.jpg"
    },
    {
        "id": "poster-195",
        "sessionNumber": 195,
        "topicEn": "Self Expression",
        "dateFa": "پنج‌شنبه ۱۱ تیر ۱۴۰۵",
        "post_id": 109,
        "photo_idx": 0,
        "filename": "poster-epd195.jpg"
    },
    {
        "id": "poster-194",
        "sessionNumber": 194,
        "topicEn": "Modern Lifestyle",
        "dateFa": "سه‌شنبه ۲ تیر ۱۴۰۵",
        "post_id": 106,
        "photo_idx": 0,
        "filename": "poster-epd194.jpg"
    },
    {
        "id": "poster-193",
        "sessionNumber": 193,
        "topicEn": "Communication Arts",
        "dateFa": "پنج‌شنبه ۲۸ خرداد ۱۴۰۵",
        "post_id": 100,
        "photo_idx": 0,
        "filename": "poster-epd193.jpg"
    },
    {
        "id": "poster-192",
        "sessionNumber": 192,
        "topicEn": "Language & Mindset",
        "dateFa": "پنج‌شنبه ۲۱ خرداد ۱۴۰۵",
        "post_id": 95,
        "photo_idx": 0,
        "filename": "poster-epd192.jpg"
    },
    {
        "id": "poster-191",
        "sessionNumber": 191,
        "topicEn": "Habit Building",
        "dateFa": "پنج‌شنبه ۱۴ خرداد ۱۴۰۵",
        "post_id": 90,
        "photo_idx": 0,
        "filename": "poster-epd191.jpg"
    },
    {
        "id": "poster-190",
        "sessionNumber": 190,
        "topicEn": "Free Discussion Opening",
        "dateFa": "پنج‌شنبه ۷ خرداد ۱۴۰۵",
        "post_id": 81,
        "photo_idx": 0,
        "filename": "poster-epd190.jpg"
    },
    {
        "id": "poster-epd11",
        "sessionNumber": 11,
        "topicEn": "EPD 11 Course",
        "dateFa": "مهر ۱۴۰۴",
        "post_id": 70,
        "photo_idx": 0,
        "filename": "poster-epd11-course.jpg"
    },
    {
        "id": "poster-epd10",
        "sessionNumber": 10,
        "topicEn": "EPD 10 Course",
        "dateFa": "مرداد ۱۴۰۴",
        "post_id": 57,
        "photo_idx": 0,
        "filename": "poster-epd10-course.jpg"
    },
    {
        "id": "poster-epd9",
        "sessionNumber": 9,
        "topicEn": "EPD 9 Course",
        "dateFa": "فروردین ۱۴۰۴",
        "post_id": 33,
        "photo_idx": 0,
        "filename": "poster-epd9-course.jpg"
    }
]

# Gallery definition: reports and gathering photos mapped to session numbers
GALLERY_SPEC = [
    {"sessionNumber": 210, "post_id": 185, "prefix": "epd210"},
    {"sessionNumber": 209, "post_id": 180, "prefix": "epd209"},
    {"sessionNumber": 208, "post_id": 177, "prefix": "epd208"},
    {"sessionNumber": 207, "post_id": 173, "prefix": "epd207"},
    {"sessionNumber": 206, "post_id": 169, "prefix": "epd206"},
    {"sessionNumber": 205, "post_id": 163, "prefix": "epd205"},
    {"sessionNumber": 204, "post_id": 159, "prefix": "epd204-a"},
    {"sessionNumber": 204, "post_id": 154, "prefix": "epd204-b"},
    {"sessionNumber": 203, "post_id": 150, "prefix": "epd203"},
    {"sessionNumber": 202, "post_id": 145, "prefix": "epd202"},
    {"sessionNumber": 200, "post_id": 134, "prefix": "epd200"},
    {"sessionNumber": 199, "post_id": 123, "prefix": "epd199"},
    {"sessionNumber": 197, "post_id": 117, "prefix": "epd197"},
    {"sessionNumber": 195, "post_id": 110, "prefix": "epd195"},
    {"sessionNumber": 194, "post_id": 107, "prefix": "epd194"},
    {"sessionNumber": 193, "post_id": 101, "prefix": "epd193"},
    {"sessionNumber": 191, "post_id": 91, "prefix": "epd191"},
    {"sessionNumber": 190, "post_id": 85, "prefix": "epd190"},
    {"sessionNumber": 11, "post_id": 71, "prefix": "epd11"},
    {"sessionNumber": 10, "post_id": 60, "prefix": "epd10-a"},
    {"sessionNumber": 10, "post_id": 58, "prefix": "epd10-b"},
    {"sessionNumber": 9, "post_id": 44, "prefix": "epd9"},
    {"sessionNumber": 8, "post_id": 19, "prefix": "epd8"}
]

def run():
    with open("C:/Users/Alireza/Desktop/my projects/epd/scripts/channel_all_posts.json", "r", encoding="utf-8") as f:
        posts = json.load(f)
    posts_by_id = {p['id']: p for p in posts}
    
    print("=== Processing & Downloading Posters ===")
    final_posters = []
    for spec in POSTERS_SPEC:
        p = posts_by_id.get(spec['post_id'])
        if not p or not p['photos'] or len(p['photos']) <= spec['photo_idx']:
            print(f"Missing photo for poster spec: {spec}")
            continue
        photo_url = p['photos'][spec['photo_idx']]
        filename = spec['filename']
        target_path = os.path.join(POSTERS_DIR, filename)
        
        print(f"Downloading poster session {spec['sessionNumber']} ({filename})...")
        ok = download_image(photo_url, target_path)
        if ok:
            final_posters.append({
                "id": spec["id"],
                "sessionNumber": spec["sessionNumber"],
                "topicEn": spec["topicEn"],
                "dateFa": spec["dateFa"],
                "image": f"/media/posters/{filename}"
            })
        else:
            print(f"Failed to download poster for {spec['id']}")
        time.sleep(0.3)
        
    print(f"Successfully processed {len(final_posters)} posters.")
    
    print("\n=== Processing & Downloading Gallery Photos ===")
    final_gallery = []
    for spec in GALLERY_SPEC:
        p = posts_by_id.get(spec['post_id'])
        if not p or not p['photos']:
            print(f"Missing photos for gallery spec: {spec}")
            continue
        for idx, photo_url in enumerate(p['photos']):
            filename = f"gallery-{spec['prefix']}-{idx+1:02d}.jpg"
            target_path = os.path.join(GALLERY_DIR, filename)
            item_id = f"gallery-{spec['prefix']}-{idx+1:02d}"
            
            print(f"Downloading gallery photo session {spec['sessionNumber']} ({filename})...")
            ok = download_image(photo_url, target_path)
            if ok:
                final_gallery.append({
                    "id": item_id,
                    "sessionNumber": spec["sessionNumber"],
                    "image": f"/media/gallery/{filename}"
                })
            else:
                print(f"Failed to download gallery photo {filename}")
            time.sleep(0.3)
            
    print(f"Successfully processed {len(final_gallery)} gallery photos.")
    
    # Sort posters by sessionNumber descending
    final_posters.sort(key=lambda x: x['sessionNumber'], reverse=True)
    # Sort gallery by sessionNumber descending
    final_gallery.sort(key=lambda x: x['sessionNumber'], reverse=True)
    
    # Save to web/data/posters.json
    posters_json_path = "C:/Users/Alireza/Desktop/my projects/epd/web/data/posters.json"
    with open(posters_json_path, "w", encoding="utf-8") as f:
        json.dump(final_posters, f, ensure_ascii=False, indent=2)
    print(f"\nSaved updated posters to {posters_json_path}")
    
    # Save to web/data/gallery.json
    gallery_json_path = "C:/Users/Alireza/Desktop/my projects/epd/web/data/gallery.json"
    with open(gallery_json_path, "w", encoding="utf-8") as f:
        json.dump(final_gallery, f, ensure_ascii=False, indent=2)
    print(f"Saved updated gallery to {gallery_json_path}")

if __name__ == "__main__":
    run()
