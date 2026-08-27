Image Optimization
===================

This repository includes a small script to convert images to WebP and create resized variants.

Prerequisites
-------------

- Python 3.8+
- Pillow

Install Pillow:

```bash
pip install pillow
```

Run the script from the project root:

```bash
python scripts/convert_images.py --quality 80 --max-width 1600 --thumb-width 800
```

What it does
------------

- Walks the `images/` folder and converts `.jpg`, `.jpeg`, and `.png` files to `.webp`.
- Creates a `-md.webp` resized copy for responsive usage.
- Leaves original files intact (creates new `.webp` alongside).

After running, the site will prefer `.webp` images for the gallery and fall back to originals if not supported.
