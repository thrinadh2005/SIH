import os
from PIL import Image, ImageDraw, ImageFont

def draw_system_architecture():
    # Dimensions (High-Res 16:9 or banner ratio)
    W, H = 2800, 1400
    img = Image.new("RGBA", (W, H), (248, 250, 252, 255)) # Soft clean background
    draw = ImageDraw.Draw(img)
    
    # Fonts
    def get_font(size, bold=False):
        try:
            if bold:
                return ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", size)
            else:
                return ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", size)
        except:
            try:
                if bold:
                    return ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
                else:
                    return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
            except:
                return ImageFont.load_default()

    font_title = get_font(56, bold=True)
    font_sub = get_font(26, bold=False)
    font_pill = get_font(28, bold=True)
    font_col_num = get_font(26, bold=True)
    font_col_title = get_font(30, bold=True)
    font_col_sub = get_font(20, bold=False)
    font_card_head = get_font(22, bold=True)
    font_card_desc = get_font(18, bold=False)
    font_bottom = get_font(20, bold=True)
    font_bottom_sub = get_font(18, bold=False)

    # 1. Header Section
    # Title: GreenFleet Quantum
    title_text = "GreenFleet Quantum"
    draw.text((W // 2 - 280, 45), title_text, font=font_title, fill=(16, 80, 48))
    # Leaf symbol / green accent
    draw.text((W // 2 + 230, 42), "🌱", font=font_title, fill=(34, 197, 94))
    
    # Subtitle: AI + Quantum for Sustainable Shipping
    draw.text((W // 2 - 210, 115), "AI + Quantum for Sustainable Shipping", font=font_sub, fill=(71, 85, 105))
    
    # Pill: System Architecture
    pill_box = (W // 2 - 160, 160, W // 2 + 160, 205)
    draw.rounded_rectangle(pill_box, radius=20, fill=(240, 253, 244), outline=(134, 239, 172), width=2)
    draw.text((W // 2 - 130, 168), "System Architecture", font=font_pill, fill=(22, 101, 52))

    # Top Right Badge
    tr_box = (W - 480, 45, W - 80, 175)
    draw.rounded_rectangle(tr_box, radius=20, fill=(240, 253, 244), outline=(187, 247, 208), width=2)
    draw.text((W - 440, 60), "Cleaner Oceans", font=get_font(24, bold=True), fill=(22, 101, 52))
    draw.text((W - 440, 95), "Greener Future", font=get_font(24, bold=True), fill=(22, 101, 52))
    draw.text((W - 440, 130), "Smarter Shipping", font=get_font(24, bold=True), fill=(22, 101, 52))

    # 2. The 5 Columns
    col_w = 480
    col_gap = 45
    start_x = 90
    top_y = 230
    col_h = 760

    columns_data = [
        {
            "num": "1",
            "title": "Data Sources",
            "sub": "Real-time Metocean & Vessel Data",
            "header_bg": (224, 242, 254),
            "header_border": (186, 230, 253),
            "num_bg": (2, 132, 199),
            "card_bg": (255, 255, 255),
            "border": (203, 213, 225),
            "items": [
                ("🛰️  Copernicus CMEMS", "Ocean Currents (u, v vectors)\nGlobal satellite current velocity grids"),
                ("🌊  Open-Meteo Marine", "Waves & Wind (Hs, Tp, Wind Speed)\nReal-time wave swell and wind angle"),
                ("🚢  AIS & Ship Sensors", "Position, Speed, Heading, Draft\nLive onboard GPS & telemetry stream")
            ]
        },
        {
            "num": "2",
            "title": "Edge Gateway",
            "sub": "Onboard Data Processing",
            "header_bg": (204, 251, 241),
            "header_border": (153, 246, 228),
            "num_bg": (13, 148, 136),
            "card_bg": (255, 255, 255),
            "border": (203, 213, 225),
            "items": [
                ("🛡️  Data Validation & Filtering", "Cleans sensor noise and verifies\ncoordinates before calculations"),
                ("💾  7-Day Local Cache", "SQLite database stored on the ship\nStores weather grids for a full week"),
                ("🧭  Dead Reckoning", "Keeps guiding the ship smoothly even\nif satellite connection drops mid-ocean"),
                ("📶  Zero Satcom Dependence", "Works 100% offline without needing\ncontinuous cloud internet access")
            ]
        },
        {
            "num": "3",
            "title": "Hydrodynamic Twin",
            "sub": "Physics-Based Vessel Model",
            "header_bg": (237, 233, 254),
            "header_border": (221, 214, 254),
            "num_bg": (124, 58, 237),
            "card_bg": (255, 255, 255),
            "border": (203, 213, 225),
            "items": [
                ("🚢  Hull Resistance (Holtrop-Mennen)", "Bare hull water friction + form factor\nAccurate calm-water drag calculation"),
                ("🌊  Wave Drag (ISO 15016)", "Added resistance from rough waves\nand storm swells pushing against hull"),
                ("💨  Wind Aerodynamic Drag", "Air drag on cargo containers and hull"),
                ("⚙️  Engine & Fuel Model (Power ∝ v³)", "Non-linear cubic propulsion mechanics\nand real engine SFOC load curves"),
                ("🌿  Multi-Fuel Emissions Model", "CO2 calculation for VLSFO, LNG, & Methanol")
            ]
        },
        {
            "num": "4",
            "title": "Hybrid Quantum Solver",
            "sub": "156-Qubit Optimization Engine",
            "header_bg": (243, 232, 255),
            "header_border": (233, 213, 255),
            "num_bg": (147, 51, 234),
            "card_bg": (255, 255, 255),
            "border": (203, 213, 225),
            "items": [
                ("⚛️  Quantum Genetic Algorithm (QGA)", "Global search across thousands of\nspeed and corridor combinations"),
                ("🌌  Quantum Particle Swarm (QPSO)", "Fine-tunes speed schedule by\ntunneling through bad weather barriers"),
                ("🎯  Multi-Objective Pareto Tradeoff", "Simultaneously balances fuel savings,\ncarbon tax, and arrival deadline (JIT)"),
                ("💻  IBM Qiskit Aer Simulator", "Simulates 156-qubit quantum circuits\nwith fast sub-second convergence")
            ]
        },
        {
            "num": "5",
            "title": "Decision & Bridge",
            "sub": "Actionable Voyage Plan",
            "header_bg": (220, 252, 231),
            "header_border": (187, 247, 208),
            "num_bg": (22, 163, 74),
            "card_bg": (255, 255, 255),
            "border": (203, 213, 225),
            "items": [
                ("🗺️  Optimized Route (5 Presets)", "Generates 5 distinct plans (e.g. Best Fuel,\nBest Weather, JIT Schedule, Green Blend)"),
                ("⏱️  Speed & RPM Guidance", "Tells the captain exact engine throttle\nfor each leg to ride ocean currents"),
                ("🖥️  ECDIS Integration (NMEA 0183)", "Exports standard .nmea waypoint files\nDirectly loads into Furuno & Transas"),
                ("📜  Regulatory Compliance Hub", "Auto-generates IMO DCS & EU MRV XML\nwith SHA-256 audit certificates")
            ]
        }
    ]

    for idx, col in enumerate(columns_data):
        cx = start_x + idx * (col_w + col_gap)
        
        # Outer Column Container
        draw.rounded_rectangle((cx, top_y, cx + col_w, top_y + col_h), radius=16, fill=(255, 255, 255), outline=col["border"], width=2)
        
        # Header Box
        header_h = 100
        draw.rounded_rectangle((cx, top_y, cx + col_w, top_y + header_h), radius=16, fill=col["header_bg"], outline=col["header_border"], width=1)
        # Fix bottom corners of header
        draw.rectangle((cx, top_y + 40, cx + col_w, top_y + header_h), fill=col["header_bg"])
        draw.line((cx, top_y + header_h, cx + col_w, top_y + header_h), fill=col["header_border"], width=1)
        
        # Number badge circle
        badge_r = 20
        badge_x = cx + 32
        badge_y = top_y + 35
        draw.ellipse((badge_x - badge_r, badge_y - badge_r, badge_x + badge_r, badge_y + badge_r), fill=col["num_bg"])
        draw.text((badge_x - 7, badge_y - 17), col["num"], font=font_col_num, fill=(255, 255, 255))
        
        # Column title & subtitle
        draw.text((cx + 65, top_y + 18), col["title"], font=font_col_title, fill=(15, 23, 42))
        draw.text((cx + 65, top_y + 58), col["sub"], font=font_col_sub, fill=(71, 85, 105))
        
        # Column Items (Cards)
        curr_y = top_y + header_h + 16
        for heading, desc in col["items"]:
            # Card shape
            card_lines = desc.count('\n') + 1
            card_h = 42 + card_lines * 24
            card_rect = (cx + 12, curr_y, cx + col_w - 12, curr_y + card_h)
            
            draw.rounded_rectangle(card_rect, radius=10, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
            
            # Heading
            draw.text((cx + 24, curr_y + 10), heading, font=font_card_head, fill=(30, 41, 59))
            
            # Desc
            draw.text((cx + 24, curr_y + 38), desc, font=font_card_desc, fill=(71, 85, 105))
            
            curr_y += card_h + 12

        # Connecting Arrow to next column
        if idx < 4:
            arrow_x = cx + col_w + 12
            arrow_y = top_y + 320
            # Draw crisp blue horizontal arrow
            draw.line((arrow_x, arrow_y, arrow_x + 20, arrow_y), fill=(14, 116, 144), width=4)
            draw.polygon([(arrow_x + 20, arrow_y - 8), (arrow_x + 20, arrow_y + 8), (arrow_x + 30, arrow_y)], fill=(14, 116, 144))

    # 3. Bottom Execution & Feedback Loop
    bot_y = top_y + col_h + 40
    
    # Bottom Right: Ship in Operation
    ship_box = (W - 550, bot_y, W - 90, bot_y + 110)
    draw.rounded_rectangle(ship_box, radius=16, fill=(238, 242, 255), outline=(199, 210, 254), width=2)
    draw.text((W - 510, bot_y + 20), "🚢  Ship In Operation", font=get_font(26, bold=True), fill=(30, 27, 75))
    draw.text((W - 510, bot_y + 60), "Real Navigation & Throttle Execution at Sea", font=get_font(18, bold=False), fill=(67, 56, 202))

    # Down arrow from Column 5 to Ship In Operation
    c5_bottom_x = start_x + 4 * (col_w + col_gap) + col_w // 2
    draw.line((c5_bottom_x, top_y + col_h + 5, c5_bottom_x, bot_y - 12), fill=(14, 116, 144), width=4)
    draw.polygon([(c5_bottom_x - 8, bot_y - 12), (c5_bottom_x + 8, bot_y - 12), (c5_bottom_x, bot_y - 2)], fill=(14, 116, 144))

    # Bottom Middle: Real-time Telemetry Feedback Card
    feed_box = (W // 2 - 320, bot_y + 10, W // 2 + 320, bot_y + 90)
    draw.rounded_rectangle(feed_box, radius=14, fill=(255, 241, 242), outline=(254, 205, 211), width=2)
    draw.text((W // 2 - 270, bot_y + 22), "🔄  Real-Time Telemetry Feedback", font=font_bottom, fill=(190, 18, 60))
    draw.text((W // 2 - 270, bot_y + 54), "Actual Position, Speed, Fuel Burn & Performance Data", font=font_bottom_sub, fill=(136, 19, 55))
    
    draw.text((W // 2 - 160, bot_y + 102), "Continuous Monitoring & Voyage Re-Optimization", font=get_font(16, bold=True), fill=(71, 85, 105))

    # Connecting Dashed Arrow from Ship -> Feedback Card -> Edge Gateway (Column 2)
    # 1. From Ship to Feedback card (left arrow)
    draw.line((W - 550, bot_y + 50, W // 2 + 320, bot_y + 50), fill=(225, 29, 72), width=3)
    draw.polygon([(W // 2 + 320, bot_y + 44), (W // 2 + 320, bot_y + 56), (W // 2 + 310, bot_y + 50)], fill=(225, 29, 72))

    # 2. From Feedback card to Column 2 (Edge Gateway)
    c2_bottom_x = start_x + 1 * (col_w + col_gap) + col_w // 2
    # Line going left
    draw.line((W // 2 - 320, bot_y + 50, c2_bottom_x, bot_y + 50), fill=(225, 29, 72), width=3)
    # Line going up to Edge Gateway
    draw.line((c2_bottom_x, bot_y + 50, c2_bottom_x, top_y + col_h + 15), fill=(225, 29, 72), width=3)
    draw.polygon([(c2_bottom_x - 8, top_y + col_h + 15), (c2_bottom_x + 8, top_y + col_h + 15), (c2_bottom_x, top_y + col_h + 3)], fill=(225, 29, 72))

    output_path = r"d:\PROJECTS\SIH\presentation_and_video\greenfleet_system_architecture.png"
    img.save(output_path, "PNG", quality=95)
    print("Saved clean architecture image to:", output_path)

if __name__ == "__main__":
    draw_system_architecture()
