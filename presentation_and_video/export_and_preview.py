import os
import sys
import win32com.client

def export_pptx():
    pptx_path = os.path.abspath(r"d:\PROJECTS\SIH\presentation_and_video\TeamBuilders-SIH26138.pptx")
    pdf_path = os.path.abspath(r"d:\PROJECTS\SIH\presentation_and_video\TeamBuilders-SIH26138.pdf")
    img_dir = os.path.abspath(r"d:\PROJECTS\SIH\presentation_and_video\slide_previews")
    
    os.makedirs(img_dir, exist_ok=True)

    # Clean old PDF if present
    if os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
            print("Cleaned previous PDF file.")
        except Exception as e:
            print(f"Warning: PDF file locked by another program: {e}")
    
    ppt_app = win32com.client.Dispatch("PowerPoint.Application")
    ppt_app.DisplayAlerts = 0  # ppAlertsNone
    
    # Check if presentation is already open in PowerPoint
    already_open = False
    presentation = None
    for p in ppt_app.Presentations:
        if os.path.normpath(p.FullName).lower() == os.path.normpath(pptx_path).lower():
            presentation = p
            already_open = True
            print("Detected presentation already open in PowerPoint.")
            break
            
    try:
        if not presentation:
            presentation = ppt_app.Presentations.Open(pptx_path, WithWindow=False)
            
        # 1. Export as PDF (format type 32 is ppSaveAsPDF)
        presentation.SaveAs(pdf_path, 32)
        print(f"Successfully exported PDF to: {pdf_path}")
        print(f"PDF Size: {os.path.getsize(pdf_path)} bytes")
        
        # 2. Export each slide as high-resolution PNG
        for idx, slide in enumerate(presentation.Slides):
            img_path = os.path.join(img_dir, f"slide_{idx+1}.png")
            slide.Export(img_path, "PNG", 1920, 1080)
            print(f"Exported Slide {idx+1} to {img_path}")
            
    except Exception as e:
        print(f"Error during export: {e}")
    finally:
        if presentation and not already_open:
            presentation.Close()
        if not already_open and len(ppt_app.Presentations) == 0:
            ppt_app.Quit()

if __name__ == "__main__":
    export_pptx()
