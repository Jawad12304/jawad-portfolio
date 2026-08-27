#!/usr/bin/env python3
"""
Build web-ready derivatives from the print-resolution masters in `images/`.

Originals are never modified. Everything this script writes lands in `assets/`
with lowercase, hyphenated, URL-safe filenames so paths behave identically on
Windows (case-insensitive) and Linux hosting (case-sensitive).

Outputs
-------
assets/work/<category>/<slug>-800.webp     masonry grid thumbnail
assets/work/<category>/<slug>-1600.webp    lightbox / full view
assets/img/*.webp                          hero, portrait, UI icons
assets/og-image.jpg                        1200x630 social preview
assets/gallery-manifest.json               paths + intrinsic sizes + alt text

Usage
-----
    pip install pillow
    python scripts/build_assets.py
"""

import json
import os
import re
import sys
from PIL import Image

# The Flyers masters are ~100 megapixel print banners; Pillow refuses those by
# default as a decompression-bomb guard. These are our own files, so lift it.
Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GRID_WIDTH = 800       # rendered in a 1-3 column masonry, never wider than ~500 CSS px
FULL_WIDTH = 1600      # lightbox on a large display
GRID_QUALITY = 78
FULL_QUALITY = 82

# Ordered exactly as the galleries appear on the site, so the running order the
# site already has is preserved.
GALLERIES = {
    "instagram": {
        "title": "Instagram",
        "images": [
            "images/instagram/instagram (1).jpg",
            "images/instagram/instagram (2).jpg",
            "images/instagram/instagram (3).jpg",
            "images/instagram/instagram (4).jpg",
            "images/instagram/instagram (5).jpg",
            "images/instagram/instagram (6).jpg",
            "images/instagram/instagram (7).jpg",
            "images/instagram/instagram (8).jpg",
            "images/instagram/instagram (9).jpg",
            "images/instagram/Blue and Beige Modern Putra Mosque Tourism Instagram Post.jpg",
            "images/instagram/AI ML.jpg",
            "images/instagram/digital marketingArtboard 1@4x-100.jpg",
            "images/instagram/finalArtboard 1@4x-100.jpg",
            "images/instagram/hiring instaArtboard 1@4x-100.jpg",
            "images/instagram/Join YEC.jpg",
            "images/instagram/Mesa de trabajo 1@4x-100.jpg",
            "images/instagram/ramzan insta post.jpg",
            "images/instagram/this (5).png",
            "images/instagram/UHO Eid Mubarak  Post (1080 x 1080 px).jpg",
            "images/instagram/UHO Eid Mubarak Instagram Post.jpg",
            "images/instagram/UPPER HAND ORGANIZATION (1).jpg",
            "images/instagram/UPPER HAND ORGANIZATION (1080 x 1080 px).png",
            "images/instagram/UPPER HAND ORGANIZATION (1080 x 1440 px).jpg",
            "images/instagram/_(1080 x 1080 px).png",
        ],
    },
    "facebook": {
        "title": "Facebook",
        "images": [
            "images/facebook/facebook (1).jpg",
            "images/facebook/facebook (1).png",
            "images/facebook/facebook (2).jpg",
            "images/facebook/facebook (2).png",
            "images/facebook/facebook (3).jpg",
            "images/facebook/facebook (4).jpg",
            "images/facebook/facebook (5).jpg",
            "images/facebook/facebook (6).jpg",
            "images/facebook/facebook (7).jpg",
            "images/facebook/facebook (8).jpg",
            "images/facebook/facebook (9).jpg",
            "images/facebook/facebook (10).jpg",
            "images/facebook/facebook (11).jpg",
            "images/facebook/facebook (12).jpg",
            "images/facebook/facebook (13).jpg",
            "images/facebook/facebook (14).jpg",
            "images/facebook/facebook (15).jpg",
            "images/facebook/facebook (16).jpg",
            "images/facebook/happy new year post@2x.jpg",
            "images/facebook/HIRINGArtboard 1@4x-100.jpg",
            "images/facebook/Ramzan x Orphans & Widows Support.jpg",
            "images/facebook/Ramzan x sahr o Iftar Donations.jpg",
            "images/facebook/Ramzan x Zakat FB.jpg",
            "images/facebook/UPPER HAND ORGANIZATION.jpg",
        ],
    },
    "flyers": {
        "title": "Flyers & Banners",
        "images": [
            "images/Flyers/flyer (1).jpg",
            "images/Flyers/flyer (2).jpg",
            "images/Flyers/abu final.jpg",
            "images/Flyers/blue modern school retractable banner (1).jpg",
            "images/Flyers/blue modern school retractable banner.jpg",
            "images/Flyers/Orange Modern Construction Retractable Banner (2).jpg",
            "images/Flyers/Orange Modern Construction Retractable Banner (3).jpg",
        ],
    },
    "productads": {
        "title": "Product Ads",
        "images": [
            "images/Product Ads/ads (1).jpg",
            "images/Product Ads/ads (2).jpg",
            "images/Product Ads/bag 2.jpg",
            "images/Product Ads/download now.jpg",
            "images/Product Ads/INVENTRO ART 1@3x@3x.jpg",
        ],
    },
    "covers": {
        "title": "Social Covers",
        "images": [
            "images/covers/Facebook cover@2x.jpg",
            "images/covers/UHO facebook cover.jpg",
            "images/covers/banner new@3x.jpg",
            "images/covers/Untitled-1.jpg",
            "images/covers/wordpressArtboard 1@4x-100.jpg",
            "images/covers/Yellow and Green Bold Stock Market YouTube Thumbnail.jpg",
        ],
    },
}

# Single images used in the page chrome. (source, output stem, max width)
SINGLES = [
    ("images/JD home.jpg", "hero-portrait", 900),
    ("images/ME/JD.jpeg", "about-portrait", 700),
    ("images/services-icons/social-media.png", "icon-social-media", 128),
    ("images/services-icons/print-media.png", "icon-print-media", 128),
    ("images/services-icons/product-ads.png", "icon-product-ads", 128),
    ("images/category-icons/instagram.png", "cat-instagram", 640),
    ("images/category-icons/facebook.png", "cat-facebook", 640),
    ("images/category-icons/flyers.png", "cat-flyers", 640),
    ("images/category-icons/product-ads.png", "cat-product-ads", 640),
    ("images/category-icons/social-covers.png", "cat-social-covers", 640),
    ("images/category-icons/visiting-cards.png", "cat-visiting-cards", 640),
]

# Filenames that carry no meaning (e.g. "instagram (4)", "Untitled-1") should not
# be surfaced as alt text. Anything matching these gets a generic description.
MEANINGLESS = re.compile(
    r"^(instagram|facebook|flyer|ads|untitled|this|mesa de trabajo|_)[\s\-_]*\(?\d*\)?$",
    re.IGNORECASE,
)


def slugify(value):
    """Lowercase, ASCII, hyphen-separated. Safe on every filesystem and in URLs."""
    value = re.sub(r"@\d+x", " ", value)                 # drop export-scale suffixes
    value = re.sub(r"artboard\s*\d*", " ", value, flags=re.I)
    value = re.sub(r"\(\d+\s*x\s*\d+\s*px\)", " ", value, flags=re.I)
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-").lower() or "image"


def humanize(stem):
    """Turn a filename into a readable title, or return None if it says nothing."""
    cleaned = re.sub(r"@\d+x", " ", stem)
    cleaned = re.sub(r"Artboard\s*\d*", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"\(\d+\s*x\s*\d+\s*px\)", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"[-_]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -")
    if not cleaned or MEANINGLESS.match(cleaned):
        return None
    if cleaned.isupper():
        cleaned = cleaned.title()
    return cleaned


def encode(img, dest, width, quality):
    """Resize (never upscale) and write a WebP. Returns the written size."""
    out = img
    if out.width > width:
        height = round(out.height * width / out.width)
        out = out.resize((width, height), Image.LANCZOS)
    out.save(dest, "WEBP", quality=quality, method=6)
    return out.size


def load(path):
    img = Image.open(path)
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        canvas = Image.new("RGB", img.size, (5, 8, 22))   # brand background
        canvas.paste(img, mask=img.split()[-1])
        return canvas
    return img.convert("RGB")


def main():
    os.chdir(ROOT)
    manifest = {}
    saved_before = saved_after = 0
    missing = []

    for key, gallery in GALLERIES.items():
        out_dir = os.path.join("assets", "work", key)
        os.makedirs(out_dir, exist_ok=True)
        used_slugs = {}
        items = []

        for source in gallery["images"]:
            local = source.replace("/", os.sep)
            if not os.path.exists(local):
                missing.append(source)
                continue

            stem = os.path.splitext(os.path.basename(source))[0]
            slug = slugify(stem)
            # Two masters can slugify identically (facebook (1).jpg / .png) — suffix.
            used_slugs[slug] = used_slugs.get(slug, 0) + 1
            if used_slugs[slug] > 1:
                slug = f"{slug}-{used_slugs[slug]}"

            saved_before += os.path.getsize(local)
            img = load(local)

            grid_path = os.path.join(out_dir, f"{slug}-{GRID_WIDTH}.webp")
            full_path = os.path.join(out_dir, f"{slug}-{FULL_WIDTH}.webp")
            grid_size = encode(img, grid_path, GRID_WIDTH, GRID_QUALITY)
            encode(img, full_path, FULL_WIDTH, FULL_QUALITY)
            img.close()
            saved_after += os.path.getsize(grid_path) + os.path.getsize(full_path)

            title = humanize(stem)
            alt = (
                f"{title} — {gallery['title']} design by Jawad Hussain"
                if title
                else f"{gallery['title']} design by Jawad Hussain"
            )

            items.append(
                {
                    "thumb": grid_path.replace(os.sep, "/"),
                    "full": full_path.replace(os.sep, "/"),
                    "w": grid_size[0],
                    "h": grid_size[1],
                    "alt": alt,
                }
            )
            print(f"  {key}/{slug}")

        manifest[key] = {"title": gallery["title"], "items": items}

    os.makedirs(os.path.join("assets", "img"), exist_ok=True)
    for source, stem, width in SINGLES:
        local = source.replace("/", os.sep)
        if not os.path.exists(local):
            missing.append(source)
            continue
        img = load(local)
        dest = os.path.join("assets", "img", f"{stem}.webp")
        size = encode(img, dest, width, 82)
        img.close()
        print(f"  {stem}.webp {size[0]}x{size[1]}")

    # Social preview card, cropped from the existing portrait — no new imagery.
    og_source = os.path.join("images", "JD home.jpg")
    if os.path.exists(og_source):
        img = load(og_source)
        target_ratio = 1200 / 630
        crop_h = round(img.width / target_ratio)
        if crop_h <= img.height:
            top = round((img.height - crop_h) * 0.18)   # bias toward the head
            img = img.crop((0, top, img.width, top + crop_h))
        else:
            crop_w = round(img.height * target_ratio)
            left = round((img.width - crop_w) / 2)
            img = img.crop((left, 0, left + crop_w, img.height))
        img = img.resize((1200, 630), Image.LANCZOS)
        img.save(os.path.join("assets", "og-image.jpg"), "JPEG", quality=84, optimize=True)
        img.close()
        print("  og-image.jpg 1200x630")

    with open(os.path.join("assets", "gallery-manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)

    print("\n--- gallery totals ---")
    print(f"masters : {saved_before / 1024 / 1024:8.1f} MB")
    print(f"web     : {saved_after / 1024 / 1024:8.1f} MB")
    if saved_before:
        print(f"reduction: {100 - saved_after / saved_before * 100:6.1f}%")
    if missing:
        print("\nMISSING SOURCES:")
        for m in missing:
            print("  " + m)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
