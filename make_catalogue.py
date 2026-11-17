from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
import os

NAVY = colors.HexColor("#14264D")
NAVY2 = colors.HexColor("#1F3864")
BLUE = colors.HexColor("#2E75B6")
GOLD = colors.HexColor("#C9A227")
GREY = colors.HexColor("#5A616E")
LIGHT = colors.HexColor("#E6F1FB")

PUB = "/home/claude/rumbu-website/public"
OUT = "/home/claude/rumbu-website/public/rumbu-product-catalogue.pdf"
W, H = A4

products = [
    ("Polypropylene (PP) Woven Mats", "products/woven-mats.jpg",
     "Standard polypropylene mats used as decorations, comfortable for sitting and creating great ambiance within spaces."),
    ("PP Twisted Twine Ropes", "products/twine-ropes.jpg",
     "Plastic twine ropes used for construction, transportation of goods, and household activities."),
    ("Customised Woven Mats", "products/custom-mats.jpg",
     "Customised mats of different sizes. Branding done per customer design and specification, using our computerised Jacquard machine."),
    ("Kettles", "products/kettles.png",
     "Durable moulded plastic kettles for everyday household use."),
    ("Bowls", "products/bowls.png",
     "Quality moulded plastic bowls in a range of sizes and colours."),
    ("Buckets", "products/buckets.png",
     "Strong moulded plastic buckets built for daily use."),
    ("PP Woven Sacks", "services/woven-sacks.jpg",
     "Quality PP woven sacks used for packaging and agricultural purposes."),
]

c = canvas.Canvas(OUT, pagesize=A4)

def draw_image_fit(path, x, y, bw, bh):
    """Draw image scaled to cover the box, centered."""
    try:
        img = Image.open(path)
        iw, ih = img.size
        scale = max(bw / iw, bh / ih)
        nw, nh = iw * scale, ih * scale
        ox = x + (bw - nw) / 2
        oy = y + (bh - nh) / 2
        c.saveState()
        p = c.beginPath()
        p.rect(x, y, bw, bh)
        c.clipPath(p, stroke=0)
        c.drawImage(ImageReader(path), ox, oy, nw, nh, mask='auto')
        c.restoreState()
    except Exception as e:
        c.setFillColor(LIGHT)
        c.rect(x, y, bw, bh, fill=1, stroke=0)

# ---------- COVER ----------
c.setFillColor(NAVY)
c.rect(0, 0, W, H, fill=1, stroke=0)
# gold ring motif
c.setStrokeColor(GOLD)
c.setLineWidth(2)
c.circle(W - 30*mm, H - 30*mm, 45*mm, stroke=1, fill=0)
c.setStrokeColor(colors.HexColor("#2A3F66"))
c.circle(30*mm, 40*mm, 55*mm, stroke=1, fill=0)

c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 11)
c.drawString(25*mm, H - 40*mm, "RUMBU INDUSTRIES LIMITED")
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 34)
c.drawString(25*mm, H - 120*mm, "Product")
c.drawString(25*mm, H - 134*mm, "Catalogue")
c.setFillColor(LIGHT)
c.setFont("Helvetica", 13)
c.drawString(25*mm, H - 150*mm, "World leader in quality polypropylene")
c.drawString(25*mm, H - 158*mm, "woven mats and twine ropes")
c.setFillColor(GOLD)
c.setFont("Helvetica", 10)
c.drawString(25*mm, 30*mm, "Kano, Nigeria  |  Since 2001  |  www.rumbuindustries.com")
c.showPage()

# ---------- ABOUT ----------
c.setFillColor(NAVY)
c.rect(0, H - 45*mm, W, 45*mm, fill=1, stroke=0)
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 10)
c.drawString(25*mm, H - 22*mm, "ABOUT US")
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 20)
c.drawString(25*mm, H - 34*mm, "Rumbu Industries Limited")

text = c.beginText(25*mm, H - 60*mm)
text.setFillColor(colors.HexColor("#1A1D24"))
text.setFont("Helvetica", 11)
text.setLeading(17)
about = ("Since its founding in Kano, Nigeria in 2001, Rumbu Industries Limited, a 100% "
         "indigenous Nigerian company, has become a leader in the manufacturing of "
         "polypropylene (PP) woven mats and woven twine. The largest in Nigeria and West "
         "Africa, and one of the largest in the world.")
about2 = ("With revenue of over $28 million and manpower of about 2,200 ground staff, Rumbu "
          "produces a wide range of quality woven mats and twine ropes. It is the first and "
          "only mat producer in Africa to operate a computerised Jacquard weaving machine, "
          "giving the ability to produce customised mats in small batches.")
import textwrap
for para in (about, about2):
    for line in textwrap.wrap(para, 82):
        text.textLine(line)
    text.textLine("")
c.drawText(text)

# stat band
c.setFillColor(NAVY2)
c.rect(0, H - 200*mm, W, 30*mm, fill=1, stroke=0)
stats = [("8 mil", "Constructed mats"), ("30 mil", "Meters of twine"),
         ("2,873", "Satisfied customers"), ("20+", "Years of excellence")]
sw = W / 4
for i, (num, lbl) in enumerate(stats):
    cx = sw * i + sw/2
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(cx, H - 184*mm, num)
    c.setFillColor(LIGHT)
    c.setFont("Helvetica", 9)
    c.drawCentredString(cx, H - 192*mm, lbl)
c.showPage()

# ---------- PRODUCT PAGES (2 per page) ----------
def header(title):
    c.setFillColor(NAVY)
    c.rect(0, H - 28*mm, W, 28*mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25*mm, H - 13*mm, "PRODUCTS")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(25*mm, H - 22*mm, title)

def product_block(name, img, desc, top):
    box_x, box_w, box_h = 25*mm, W - 50*mm, 62*mm
    box_y = top - box_h
    draw_image_fit(os.path.join(PUB, img), box_x, box_y, box_w, box_h)
    # caption bar
    c.setFillColor(NAVY)
    c.rect(box_x, box_y, box_w, 10*mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(box_x + 5*mm, box_y + 3.3*mm, name)
    # description
    t = c.beginText(box_x, box_y - 8*mm)
    t.setFillColor(GREY)
    t.setFont("Helvetica", 10.5)
    t.setLeading(15)
    for line in textwrap.wrap(desc, 90):
        t.textLine(line)
    c.drawText(t)

pairs = [products[i:i+2] for i in range(0, len(products), 2)]
for pi, pair in enumerate(pairs):
    header("Our range" if pi == 0 else "Our range (cont.)")
    tops = [H - 45*mm, H - 165*mm]
    for j, (name, img, desc) in enumerate(pair):
        product_block(name, img, desc, tops[j])
    # footer
    c.setFillColor(GREY)
    c.setFont("Helvetica", 8)
    c.drawCentredString(W/2, 12*mm, "Rumbu Industries Limited  |  www.rumbuindustries.com  |  +234 803 691 8902")
    c.showPage()

# ---------- CONTACT ----------
c.setFillColor(NAVY)
c.rect(0, 0, W, H, fill=1, stroke=0)
c.setStrokeColor(GOLD); c.setLineWidth(2)
c.circle(W - 25*mm, 30*mm, 40*mm, stroke=1, fill=0)
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 11)
c.drawString(25*mm, H - 45*mm, "GET IN TOUCH")
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 26)
c.drawString(25*mm, H - 62*mm, "Let's work together")
info = [
    ("Head Office", "KM 4 Hadejia Road, Opp. Sir Muhd Sanusi Hospital, Kano, Nigeria"),
    ("Phone", "+234 803 691 8902  |  +234 814 444 9789"),
    ("Email", "info@rumbuindustries.com"),
    ("Web", "www.rumbuindustries.com"),
]
y = H - 90*mm
for lbl, val in info:
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 11)
    c.drawString(25*mm, y, lbl)
    c.setFillColor(LIGHT); c.setFont("Helvetica", 11)
    c.drawString(25*mm, y - 6*mm, val)
    y -= 20*mm
c.showPage()

c.save()
print("Catalogue created:", OUT, os.path.getsize(OUT), "bytes")
