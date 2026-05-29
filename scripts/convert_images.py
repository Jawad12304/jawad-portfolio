#!/usr/bin/env python3
"""
Bulk-convert images under `images/` to WebP and produce a resized version.

Usage:
    pip install pillow
    python scripts/convert_images.py --quality 80 --max-width 1600 --thumb-width 800

This will create `.webp` files alongside originals and also produce `-md.webp` resized copies.
"""
import os
import argparse
from PIL import Image


def convert_image(path, quality=80, max_width=None, suffix=""):
    try:
        img = Image.open(path)
        img = img.convert('RGB')
        if max_width and img.width > max_width:
            wpercent = (max_width / float(img.width))
            hsize = int((float(img.height) * float(wpercent)))
            img = img.resize((max_width, hsize), Image.LANCZOS)

        base, _ = os.path.splitext(path)
        out = f"{base}{suffix}.webp"
        img.save(out, 'WEBP', quality=quality, method=6)
        print('Saved', out)
    except Exception as e:
        print('Error converting', path, e)


def find_images(root='images'):
    exts = ('.jpg', '.jpeg', '.png')
    for dirpath, dirs, files in os.walk(root):
        for f in files:
            if f.lower().endswith(exts):
                yield os.path.join(dirpath, f)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='images', help='Images root folder')
    parser.add_argument('--quality', type=int, default=80)
    parser.add_argument('--max-width', type=int, default=1600)
    parser.add_argument('--thumb-width', type=int, default=800)
    args = parser.parse_args()

    for path in find_images(args.root):
        # create full-size webp (may be resized down to max-width)
        convert_image(path, quality=args.quality, max_width=args.max_width, suffix='')
        # create medium/responsive variant
        convert_image(path, quality=max(60, args.quality - 20), max_width=args.thumb_width, suffix='-md')


if __name__ == '__main__':
    main()
