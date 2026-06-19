from PIL import Image
import os

brain_dir = r"C:\Users\hp\.gemini\antigravity-ide\brain\8db4523d-d845-4283-9b6d-57d904ee4fda"
out_dir = r"c:\Users\hp\Music\nv\app\public\imajes"

images = {
    "tacos_bread": "media__1781656914217.jpg",   # tacos flatbread
    "pizza_dough": "media__1781656914231.jpg",   # pizza dough ball
    "shawarma": "media__1781656914244.jpg",       # shawarma wrap (PRODUCT image)
    "shawarma_chicken": "media__1781656914275.jpg", # raw chicken shawarma ingredient
}

def process_white_bg(in_path, out_path, threshold=235):
    """Remove white background and center 80% on transparent 1:1 canvas"""
    img = Image.open(in_path).convert("RGBA")
    data = img.load()
    w, h = img.size
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = data[x, y]
            if r > threshold and g > threshold and b > threshold:
                data[x, y] = (255, 255, 255, 0)
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    max_dim = max(img.width, img.height)
    canvas_size = int(max_dim / 0.8)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    x = (canvas_size - img.width) // 2
    y = (canvas_size - img.height) // 2
    canvas.paste(img, (x, y), img)
    canvas.save(out_path, "PNG")
    print(f"Saved: {out_path}")


def process_with_bg(in_path, out_path):
    """For images with non-white background: just crop to square and save"""
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    # Crop to center square
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    img.save(out_path, "PNG")
    print(f"Saved (center-crop): {out_path}")


for name, fname in images.items():
    in_path = os.path.join(brain_dir, fname)
    out_path = os.path.join(out_dir, f"{name}.png")
    if not os.path.exists(in_path):
        print(f"NOT FOUND: {in_path}")
        continue
    
    # shawarma_chicken has a styled background, use center-crop
    if name == "shawarma_chicken":
        process_with_bg(in_path, out_path)
    else:
        process_white_bg(in_path, out_path, threshold=235)
