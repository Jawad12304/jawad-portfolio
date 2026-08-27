#!/usr/bin/env python3
"""
Build a complete favicon set from the existing brand mark (images/fav-icon.png).

Everything is written to the site root, because that is the only location every
consumer agrees on: browsers request /favicon.ico unconditionally, and root
paths resolve identically from the homepage, a nested page, and a trailing-slash
URL — on GitHub Pages and on Namecheap's public_html alike.

Usage
-----
    pip install pillow
    python scripts/build_favicons.py
"""

import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "images", "fav-icon.png")

# Brand background, matching --bg-0 in the stylesheet. Used wherever a platform
# composites the icon onto an unknown surface (iOS home screen, maskable icons).
BRAND_BG = (5, 8, 22, 255)


def load_mark():
    img = Image.open(SOURCE).convert("RGBA")
    # Trim the transparent margin so the mark fills the canvas it is given —
    # otherwise it renders visibly smaller than neighbouring tabs' icons.
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    # Square it off without distorting the circular mark.
    side = max(img.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return square


def transparent(mark, size, pad=0.0):
    """Icon on a transparent canvas, mark inset by `pad` of the total size."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner = round(size * (1 - pad * 2))
    resized = mark.resize((inner, inner), Image.LANCZOS)
    offset = (size - inner) // 2
    canvas.paste(resized, (offset, offset), resized)
    return canvas


def on_brand(mark, size, pad=0.0):
    """Icon composited onto the opaque brand background (no alpha)."""
    canvas = Image.new("RGBA", (size, size), BRAND_BG)
    inner = round(size * (1 - pad * 2))
    resized = mark.resize((inner, inner), Image.LANCZOS)
    offset = (size - inner) // 2
    canvas.alpha_composite(resized, (offset, offset))
    return canvas.convert("RGB")


def main():
    if not os.path.exists(SOURCE):
        print(f"ERROR: source mark not found at {SOURCE}")
        return 1

    mark = load_mark()
    print(f"source mark: {mark.size[0]}x{mark.size[1]}")
    out = lambda name: os.path.join(ROOT, name)

    # Classic .ico — multi-resolution so Windows/browser chrome picks the best.
    # Requested unconditionally by browsers and by Google Search.
    # 16/32/48 only. Larger frames inside an .ico just inflate it — every modern
    # consumer that wants a big icon reads the PNG links or the manifest instead.
    transparent(mark, 64).save(
        out("favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("  favicon.ico  16/32/48")

    # Modern PNG icons for browsers that prefer them over the .ico.
    for size in (16, 32, 48):
        transparent(mark, size).save(out(f"favicon-{size}x{size}.png"), optimize=True)
        print(f"  favicon-{size}x{size}.png")

    # iOS home screen. Must be opaque — iOS composites transparency onto black
    # and rounds the corners itself, so we supply the brand background and pad
    # the mark away from the corner radius.
    on_brand(mark, 180, pad=0.10).save(out("apple-touch-icon.png"), optimize=True)
    print("  apple-touch-icon.png 180x180")

    # Android / PWA manifest icons.
    for size in (192, 512):
        transparent(mark, size).save(out(f"icon-{size}.png"), optimize=True)
        print(f"  icon-{size}.png")

    # Maskable icon: Android may crop this to any shape, so the mark must sit
    # inside the 80% safe zone on an opaque background.
    on_brand(mark, 512, pad=0.14).save(out("icon-maskable-512.png"), optimize=True)
    print("  icon-maskable-512.png")

    # Monochrome SVG for Safari's pinned-tab mask, traced as a flat disc with the
    # mark knocked out is not possible from a raster source, so we reuse the
    # brand SVG instead — see index.html. Nothing to generate here.

    for name in sorted(os.listdir(ROOT)):
        if name.startswith(("favicon", "apple-touch", "icon-")):
            size = os.path.getsize(os.path.join(ROOT, name))
            print(f"    {name:26} {size / 1024:6.1f} KB")

    return 0


if __name__ == "__main__":
    sys.exit(main())
