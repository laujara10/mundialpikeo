#!/usr/bin/env python3
"""Generador de piezas visuales — La Tribu Pikeo · Mundial 2026"""

import math
import os
import urllib.request
import struct
import zlib

FONTS_DIR = os.path.join(
    os.path.expanduser("~"),
    "Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin"
    "/fa1a8c04-7c20-4952-b43c-4ec5abc0fa3e/e67633ee-11fb-4170-b8e5-bf5a262928b4"
    "/skills/canvas-design/canvas-fonts"
)

OUT_DIR = "/Users/laurajaramillo/MUNDIAL PIKEO/piezas"

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    PIL_OK = True
except ImportError:
    PIL_OK = False

def font(name, size):
    path = os.path.join(FONTS_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

# ─── QR real via API ──────────────────────────────────────────────────────────
def get_qr_image(url, size=400):
    api = f"https://api.qrserver.com/v1/create-qr-code/?size={size}x{size}&data={url}&bgcolor=f4e6c9&color=0e0905&qzone=2&format=png"
    try:
        req = urllib.request.Request(api, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            import io
            return Image.open(io.BytesIO(r.read())).convert("RGBA")
    except:
        return None

# ─── Helpers ──────────────────────────────────────────────────────────────────
NEGRO   = (14, 9, 5)
NARANJA = (216, 69, 11)
AMBAR   = (219, 140, 35)
CREMA   = (244, 230, 201)
VERDE   = (43, 83, 46)
VERDE_L = (126, 200, 130)
CARD    = (26, 16, 8)

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgba(rgb, a):
    return (*rgb, a)

def glow(img, draw, cx, cy, r, color, steps=8):
    for i in range(steps, 0, -1):
        alpha = int(18 * (i / steps))
        rr = r + (steps - i) * 18
        overlay = Image.new("RGBA", img.size, (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([cx-rr, cy-rr, cx+rr, cy+rr], fill=(*color, alpha))
        img.alpha_composite(overlay)

def rounded_rect(draw, x0, y0, x1, y1, r, fill=None, outline=None, width=2):
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill, outline=outline, width=width)

def pill(draw, cx, y, text, fnt, bg, fg, pad_x=24, pad_h=14):
    bb = draw.textbbox((0,0), text, font=fnt)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    x0, y0 = cx - tw//2 - pad_x, y
    x1, y1 = cx + tw//2 + pad_x, y + th + pad_h*2
    draw.rounded_rectangle([x0, y0, x1, y1], radius=(y1-y0)//2, fill=bg)
    draw.text((cx - tw//2, y0 + pad_h - bb[1]), text, font=fnt, fill=fg)
    return y1

def center_text(draw, cx, y, text, fnt, fill):
    bb = draw.textbbox((0,0), text, font=fnt)
    tw = bb[2] - bb[0]
    draw.text((cx - tw//2, y - bb[1]), text, font=fnt, fill=fill)
    return bb[3] - bb[1]

BENEFIT_ICONS = {"🥂": "✦", "🏆": "★", "🎯": "◎", "⏳": "◈"}

def benefit_card(img, draw, x0, y0, x1, y1, icon, text, fnt_icon, fnt_text):
    rounded_rect(draw, x0, y0, x1, y1, 14,
                 fill=(*CARD, 200),
                 outline=(*CREMA, 22), width=1)
    mid_y = (y0 + y1) // 2
    sym = BENEFIT_ICONS.get(icon, "·")
    bb_i = draw.textbbox((0,0), sym, font=fnt_icon)
    ih = bb_i[3] - bb_i[1]
    draw.text((x0 + 24, mid_y - ih//2 - bb_i[1]), sym, font=fnt_icon, fill=NARANJA)
    bb = draw.textbbox((0,0), text, font=fnt_text)
    th = bb[3] - bb[1]
    draw.text((x0 + 72, mid_y - th//2 - bb[1]), text, font=fnt_text, fill=(*CREMA, 220))

# ═══════════════════════════════════════════════════════════════════════════════
#  PIEZA 1 — HISTORIA INSTAGRAM  1080 × 1920
# ═══════════════════════════════════════════════════════════════════════════════
def make_historia():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), (*NEGRO, 255))
    draw = ImageDraw.Draw(img)

    # ── Glow naranja superior ──
    glow(img, draw, W//2, -60, 520, NARANJA, steps=12)

    # ── Glow verde inferior sutil ──
    glow(img, draw, W - 100, H + 40, 380, VERDE, steps=8)

    draw = ImageDraw.Draw(img)

    # ── Fuentes ──
    f_pikeo    = font("BigShoulders-Bold.ttf",    88)
    f_picnic   = font("WorkSans-Bold.ttf",         22)
    f_eyebrow  = font("WorkSans-Bold.ttf",         22)
    f_badge    = font("WorkSans-Bold.ttf",         21)
    f_tribu    = font("BigShoulders-Bold.ttf",    130)
    f_pikeo2   = font("BigShoulders-Bold.ttf",    148)
    f_benefit  = font("WorkSans-Bold.ttf",         28)
    f_icon     = font("WorkSans-Regular.ttf",      34)
    f_cta      = font("BigShoulders-Bold.ttf",     46)
    f_scan     = font("WorkSans-Regular.ttf",       30)
    f_footer   = font("WorkSans-Regular.ttf",       22)

    cx = W // 2
    y = 72

    # ── Logo PIKEO ──
    center_text(draw, cx, y, "PIKEO", f_pikeo, NARANJA)
    y += 96
    center_text(draw, cx, y, "◆  P I C N I C  ◆", f_picnic, AMBAR)
    y += 52

    # ── Línea decorativa ──
    draw.line([(cx-80, y), (cx+80, y)], fill=(*NARANJA, 60), width=1)
    y += 28

    # ── Badge verde ──
    badge_txt = "●  MUNDIAL 2026  ·  CUPOS DISPONIBLES"
    bb = draw.textbbox((0,0), badge_txt, font=f_badge)
    bw = bb[2] - bb[0]; bh = bb[3] - bb[1]
    bx0, by0 = cx - bw//2 - 26, y
    bx1, by1 = cx + bw//2 + 26, y + bh + 20
    draw.rounded_rectangle([bx0,by0,bx1,by1], radius=(by1-by0)//2,
                            fill=(*VERDE, 55), outline=(*VERDE_L, 120), width=1)
    draw.text((bx0+26, by0+10 - bb[1]), badge_txt, font=f_badge, fill=VERDE_L)
    y = by1 + 38

    # ── Eyebrow ──
    center_text(draw, cx, y, "NO TODOS VEN EL PARTIDO. ALGUNOS LO VIVEN.", f_eyebrow, AMBAR)
    y += 42

    # ── Título ──
    center_text(draw, cx, y, "LA TRIBU", f_tribu, CREMA)
    y += 128
    center_text(draw, cx, y, "PIKEO  ⚽", f_pikeo2, NARANJA)
    y += 158

    # ── 4 beneficios ──
    benefits = [
        ("✦", "Cortesía de bienvenida al reservar"),
        ("★", "Premios para quien acierte el marcador"),
        ("◎", "Sorteo final del Mundial para todos"),
        ("◈", "Cupos limitados por partido"),
    ]
    card_h = 76
    card_gap = 14
    pad = 44

    for icon, txt in benefits:
        benefit_card(img, draw,
                     pad, y, W - pad, y + card_h,
                     icon, txt, f_icon, f_benefit)
        y += card_h + card_gap

    y += 30

    # ── QR ──
    qr = get_qr_image("https://mundialpikeo-production.up.railway.app", 440)
    qr_size = 340
    if qr:
        qr = qr.resize((qr_size, qr_size), Image.LANCZOS)
        # Marco crema
        frame_pad = 16
        fx0 = cx - qr_size//2 - frame_pad
        fy0 = y - frame_pad
        fx1 = cx + qr_size//2 + frame_pad
        fy1 = y + qr_size + frame_pad
        draw.rounded_rectangle([fx0,fy0,fx1,fy1], radius=18, fill=(*CREMA, 255))
        img.paste(qr, (cx - qr_size//2, y), qr)
        y = fy1 + 22
    else:
        # Placeholder
        qr_size = 300
        fx0 = cx - qr_size//2 - 16; fy0 = y - 16
        fx1 = cx + qr_size//2 + 16; fy1 = y + qr_size + 16
        draw.rounded_rectangle([fx0,fy0,fx1,fy1], radius=18, fill=(*CREMA, 255))
        draw.rounded_rectangle([fx0+10,fy0+10,fx1-10,fy1-10], radius=12,
                                outline=(*NEGRO,60), width=2)
        center_text(draw, cx, y + qr_size//2 - 20, "QR CODE", f_benefit, NEGRO)
        y = fy1 + 22

    # ── Texto bajo QR ──
    center_text(draw, cx, y, "Escanea y participa", f_scan, (*CREMA, 160))
    y += 52

    # ── Botón CTA ──
    cta_txt = "RESERVAR Y PARTICIPAR"
    bb = draw.textbbox((0,0), cta_txt, font=f_cta)
    cw = bb[2]-bb[0]; ch = bb[3]-bb[1]
    bpad = 38
    bx0 = pad; by0 = y
    bx1 = W-pad; by1 = y + ch + bpad*2
    draw.rounded_rectangle([bx0,by0,bx1,by1], radius=18, fill=NARANJA)
    # sombra sutil arriba
    shadow = Image.new("RGBA", img.size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([bx0,by0,bx1,by1], radius=18, fill=(*NARANJA, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([bx0,by0,bx1,by1], radius=18, fill=NARANJA)
    draw.text((cx - cw//2, by0 + bpad - bb[1]), cta_txt, font=f_cta, fill=CREMA)
    y = by1 + 28

    # ── Footer ──
    center_text(draw, cx, y, "pikeo.com.co  ·  La Tribu Pikeo", f_footer, (*CREMA, 55))

    # ── Guardar ──
    out = img.convert("RGB")
    path = os.path.join(OUT_DIR, "historia-instagram.png")
    out.save(path, "PNG", quality=98)
    print(f"✅ Historia guardada: {path}")


# ═══════════════════════════════════════════════════════════════════════════════
#  PIEZA 2 — PÓSTER LOCAL  1080 × 1440
# ═══════════════════════════════════════════════════════════════════════════════
def make_poster():
    W, H = 1080, 1440
    img = Image.new("RGBA", (W, H), (*NEGRO, 255))
    draw = ImageDraw.Draw(img)

    # ── Glows ──
    glow(img, draw, W//2, -80, 620, NARANJA, steps=14)
    glow(img, draw, W//2, H + 80, 460, VERDE, steps=10)

    # ── Banda naranja superior ──
    band_h = 10
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, band_h], fill=NARANJA)

    # ── Banda naranja inferior ──
    draw.rectangle([0, H - band_h, W, H], fill=NARANJA)

    # ── Fuentes ──
    f_logo     = font("BigShoulders-Bold.ttf",   72)
    f_sub_logo = font("WorkSans-Bold.ttf",        20)
    f_mundial  = font("BigShoulders-Bold.ttf",   108)
    f_en_pikeo = font("BigShoulders-Bold.ttf",   136)
    f_sub      = font("WorkSans-Regular.ttf",     32)
    f_scan     = font("WorkSans-Bold.ttf",        30)
    f_scan_sub = font("WorkSans-Regular.ttf",     26)
    f_pill     = font("WorkSans-Bold.ttf",        24)
    f_footer   = font("WorkSans-Regular.ttf",     22)

    cx = W // 2
    y = 42

    # ── Logo ──
    center_text(draw, cx, y, "PIKEO", f_logo, NARANJA)
    y += 78
    center_text(draw, cx, y, "◆  P I C N I C  ◆", f_sub_logo, AMBAR)
    y += 44

    draw.line([(cx-100, y), (cx+100, y)], fill=(*NARANJA, 55), width=1)
    y += 36

    # ── Titular ──
    center_text(draw, cx, y, "MUNDIAL", f_mundial, CREMA)
    y += 112
    center_text(draw, cx, y, "EN PIKEO  ⚽", f_en_pikeo, NARANJA)
    y += 148

    # ── Subtítulo ──
    center_text(draw, cx, y, "Reserva tu mesa  ·  Deja tu pronóstico  ·  Gana premios", f_sub, (*CREMA, 170))
    y += 60

    draw.line([(cx-160, y), (cx+160, y)], fill=(*NARANJA, 35), width=1)
    y += 42

    # ── QR ──
    qr = get_qr_image("https://mundialpikeo-production.up.railway.app", 480)
    qr_size = 380

    # Marco con sombra naranja
    frame_pad = 20
    fx0 = cx - qr_size//2 - frame_pad
    fy0 = y - frame_pad
    fx1 = cx + qr_size//2 + frame_pad
    fy1 = y + qr_size + frame_pad

    # Sombra
    shadow = Image.new("RGBA", img.size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([fx0+6,fy0+8,fx1+6,fy1+8], radius=22, fill=(*NARANJA, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    img.alpha_composite(shadow)
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([fx0,fy0,fx1,fy1], radius=22, fill=(*CREMA, 255))

    if qr:
        qr = qr.resize((qr_size, qr_size), Image.LANCZOS)
        img.paste(qr, (cx - qr_size//2, y), qr)
    else:
        draw.rounded_rectangle([fx0+14,fy0+14,fx1-14,fy1-14], radius=14,
                                outline=(*NEGRO,50), width=2)
        f_qr_ph = font("WorkSans-Bold.ttf", 38)
        center_text(draw, cx, y + qr_size//2 - 22, "QR CODE", f_qr_ph, NEGRO)
    draw = ImageDraw.Draw(img)

    y = fy1 + 30

    # ── "Apunta tu cámara" ──
    center_text(draw, cx, y, "Apunta tu cámara aquí", f_scan, (*CREMA, 200))
    y += 42
    center_text(draw, cx, y, "o busca:", f_scan_sub, (*CREMA, 100))
    y += 34
    center_text(draw, cx, y, "mundialpikeo-production.up.railway.app", f_scan_sub, (*AMBAR, 180))
    y += 54

    draw.line([(cx-160, y), (cx+160, y)], fill=(*NARANJA, 35), width=1)
    y += 34

    # ── Pills de beneficios ──
    pills = [
        ("✦", "Cortesía al reservar"),
        ("★", "Premios al acertar"),
        ("◎", "Sorteo final"),
        ("◈", "Cupos limitados"),
    ]
    pill_h = 52
    pill_gap = 12
    pad = 40
    pill_w = (W - pad*2 - pill_gap*3) // 4

    for i, (icon, txt) in enumerate(pills):
        px0 = pad + i * (pill_w + pill_gap)
        px1 = px0 + pill_w
        py0 = y; py1 = y + pill_h
        draw.rounded_rectangle([px0,py0,px1,py1], radius=pill_h//2,
                                fill=(*CARD, 220), outline=(*CREMA, 20), width=1)
        full = f"{icon} {txt}"
        bb = draw.textbbox((0,0), full, font=f_pill)
        tw = bb[2]-bb[0]; th = bb[3]-bb[1]
        pill_cx = (px0+px1)//2
        pill_cy = (py0+py1)//2
        draw.text((pill_cx - tw//2, pill_cy - th//2 - bb[1]), full, font=f_pill, fill=(*CREMA, 210))

    y += pill_h + 38

    # ── Footer ──
    center_text(draw, cx, y, "La Tribu Pikeo  ·  Mundial 2026  ·  pikeo.com.co", f_footer, (*CREMA, 50))

    out = img.convert("RGB")
    path = os.path.join(OUT_DIR, "poster-local.png")
    out.save(path, "PNG", quality=98)
    print(f"✅ Póster guardado: {path}")


if __name__ == "__main__":
    if not PIL_OK:
        print("Instalando Pillow...")
        import subprocess, sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
        from PIL import Image, ImageDraw, ImageFont, ImageFilter
    print("🎨 Generando historia de Instagram...")
    make_historia()
    print("🎨 Generando póster para el local...")
    make_poster()
    print("\n✅ Listo. Ambas piezas en /Users/laurajaramillo/MUNDIAL PIKEO/piezas/")
