from PIL import Image
import os

logo_path = r"C:\Users\hp\Music\nv\app\public\paplo-logo.png"
res_dir = r"c:\Users\hp\Music\nv\app\android\app\src\main\res"

# Android icon sizes per density
sizes = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

img = Image.open(logo_path).convert("RGBA")

# Make square by center-cropping
w, h = img.size
min_dim = min(w, h)
left = (w - min_dim) // 2
top = (h - min_dim) // 2
img = img.crop((left, top, left + min_dim, top + min_dim))

for folder, size in sizes.items():
    out_dir = os.path.join(res_dir, folder)
    os.makedirs(out_dir, exist_ok=True)
    
    resized = img.resize((size, size), Image.LANCZOS)
    
    # Save both ic_launcher and ic_launcher_round
    resized.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")
    resized.save(os.path.join(out_dir, "ic_launcher_round.png"), "PNG")
    
    # Also save ic_launcher_foreground for adaptive icons (512px space = size + padding)
    fg_size = int(size * 1.5)
    canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    paste_x = (fg_size - size) // 2
    paste_y = (fg_size - size) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    canvas.save(os.path.join(out_dir, "ic_launcher_foreground.png"), "PNG")
    
    print(f"Done: {folder} ({size}x{size})")

print("All icons generated!")
