import os
import sys
import subprocess
import time
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

BASE_DIR = r"d:\PROJECTS\SIH\presentation_and_video"
FINAL_DIR = os.path.join(BASE_DIR, "FINAL")
PPTX_SLIDES_DIR = os.path.join(FINAL_DIR, "pptx_slides")
AUDIO_DIR = os.path.join(BASE_DIR, "video_assets", "audio_6min")
OVERLAYS_DIR = os.path.join(BASE_DIR, "video_assets", "overlays_6min")
SEGMENTS_DIR = os.path.join(BASE_DIR, "video_assets", "segments_6min")
USER_RECORDING = os.path.join(BASE_DIR, "Screen Recording 2026-09-18 011534.mp4")
CONCLUSION_FRAME = os.path.join(BASE_DIR, "video_assets", "rendered_frames_chris", "clean_conclusion_1080p.png")

os.makedirs(SEGMENTS_DIR, exist_ok=True)

def get_audio_duration(path):
    cmd = [ffmpeg, "-i", path]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
    return 0.0

# 1. Slide segments configuration
SLIDE_SEGMENTS = [
    {
        "id": "seg_01_slide_intro",
        "title": "Slide 1: Title & Team Introduction",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_1.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_01_intro.mp3"),
        "pad": 0.4
    },
    {
        "id": "seg_02_slide_problem",
        "title": "Slide 2: Idea & Proposed Solution",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_2.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_02_problem.mp3"),
        "pad": 0.4
    },
    {
        "id": "seg_03_slide_flowchart",
        "title": "Slide 3: Technical Approach & Flowchart",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_3.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_03_flowchart.mp3"),
        "pad": 0.4
    },
    {
        "id": "seg_04_slide_feasibility",
        "title": "Slide 4: Feasibility & Commercial Viability",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_4.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_04_feasibility.mp3"),
        "pad": 0.4
    },
    {
        "id": "seg_05_slide_impact",
        "title": "Slide 5: Impact & Verified Metrics",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_5.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_05_impact.mp3"),
        "pad": 0.4
    },
    {
        "id": "seg_06_slide_standards",
        "title": "Slide 6: Research & References",
        "img": os.path.join(PPTX_SLIDES_DIR, "slide_6.png"),
        "audio": os.path.join(AUDIO_DIR, "slide_06_standards.mp3"),
        "pad": 0.4
    }
]

# 2. Prototype sub-clips configuration
PROTO_SEGMENTS = [
    {"name": "proto_01_fleet",       "t_start": 0.0,   "t_end": 29.0},
    {"name": "proto_02_planner",     "t_start": 29.0,  "t_end": 58.0},
    {"name": "proto_03_quantum",     "t_start": 58.0,  "t_end": 86.0},
    {"name": "proto_04_results",     "t_start": 86.0,  "t_end": 110.0},
    {"name": "proto_05_commercial",  "t_start": 110.0, "t_end": 138.0},
    {"name": "proto_06_edge",        "t_start": 138.0, "t_end": 166.0},
    {"name": "proto_07_decarb",      "t_start": 166.0, "t_end": 191.0},
    {"name": "proto_08_command",     "t_start": 191.0, "t_end": 222.0},
    {"name": "proto_09_arena",       "t_start": 222.0, "t_end": 249.0},
    {"name": "proto_10_heron",       "t_start": 249.0, "t_end": 272.0},
    {"name": "proto_11_compliance",  "t_start": 272.0, "t_end": 287.77},
]

def render_slides():
    slide_outputs = []
    print("\n==========================================")
    print("STEP 1: RENDERING PRESENTATION SLIDE SEGMENTS")
    print("==========================================")
    for seg in SLIDE_SEGMENTS:
        out_path = os.path.join(SEGMENTS_DIR, f"{seg['id']}.mp4")
        slide_outputs.append(out_path)
        a_dur = get_audio_duration(seg["audio"])
        total_dur = a_dur + seg["pad"]
        print(f"[*] Rendering {seg['title']} (Speech: {a_dur:.2f}s + {seg['pad']}s pad = {total_dur:.2f}s)...")
        
        af_filter = f"apad=pad_dur={seg['pad']}"
        cmd = [
            ffmpeg, "-y",
            "-loop", "1", "-framerate", "30", "-i", seg["img"],
            "-i", seg["audio"],
            "-af", af_filter,
            "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-r", "30",
            "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
            "-shortest",
            out_path
        ]
        subprocess.run(cmd, check=True)
        print(f"    -> [✓] Done: {os.path.basename(out_path)} ({os.path.getsize(out_path):,} bytes)")
    return slide_outputs

def render_prototype():
    print("\n==========================================")
    print("STEP 2: RENDERING LIVE PROTOTYPE SEGMENTS")
    print("==========================================")
    proto_sub_paths = []
    
    for idx, p in enumerate(PROTO_SEGMENTS):
        name = p["name"]
        t_start = p["t_start"]
        t_end = p["t_end"]
        v_dur = t_end - t_start
        
        audio_file = os.path.join(AUDIO_DIR, f"{name}.mp3")
        overlay_file = os.path.join(OVERLAYS_DIR, f"{name}.png")
        sub_out = os.path.join(SEGMENTS_DIR, f"sub_{name}.mp4")
        proto_sub_paths.append(sub_out)
        
        a_dur = get_audio_duration(audio_file)
        # Pad 0.2s between subsegments
        target_dur = a_dur + 0.2
        speed_factor = a_dur / v_dur
        
        print(f"[*] Sub-Module {idx+1}/11: {name} (Video: {v_dur:.2f}s -> Audio: {a_dur:.2f}s, speed={1/speed_factor:.2f}x)...")
        
        # Filter complex:
        # 1. Trim video to window
        # 2. Scale & pad to 1920x1080
        # 3. Adjust PTS to match exact speech duration
        # 4. Overlay badge banner
        # 5. Pad audio with 0.2s
        filter_complex = (
            f"[0:v]trim=start={t_start}:end={t_end},setpts=PTS-STARTPTS,"
            f"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,"
            f"setpts=PTS*{speed_factor}[vscaled];"
            f"[vscaled][1:v]overlay=0:0:format=auto[vout]"
        )
        
        cmd = [
            ffmpeg, "-y",
            "-i", USER_RECORDING,
            "-i", overlay_file,
            "-i", audio_file,
            "-filter_complex", filter_complex,
            "-map", "[vout]",
            "-map", "2:a",
            "-af", "apad=pad_dur=0.2",
            "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-r", "30",
            "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
            "-shortest",
            sub_out
        ]
        subprocess.run(cmd, check=True)
        print(f"    -> [✓] Rendered: {os.path.basename(sub_out)} ({os.path.getsize(sub_out):,} bytes)")

    # Concatenate all proto sub-clips into one master proto segment
    proto_concat_manifest = os.path.join(SEGMENTS_DIR, "proto_manifest.txt")
    with open(proto_concat_manifest, "w", encoding="utf-8") as f:
        for p_path in proto_sub_paths:
            f.write(f"file '{p_path.replace(os.sep, '/')}'\n")
            
    proto_master_out = os.path.join(SEGMENTS_DIR, "seg_07_prototype_master.mp4")
    print(f"\n[*] Concatenating 11 prototype modules into: {os.path.basename(proto_master_out)}...")
    cmd_concat_proto = [
        ffmpeg, "-y",
        "-f", "concat", "-safe", "0",
        "-i", proto_concat_manifest,
        "-c", "copy",
        proto_master_out
    ]
    subprocess.run(cmd_concat_proto, check=True)
    print(f"    -> [✓] Prototype Master Segment: {os.path.getsize(proto_master_out):,} bytes")
    return proto_master_out

def render_conclusion():
    print("\n==========================================")
    print("STEP 3: RENDERING CONCLUSION SEGMENT")
    print("==========================================")
    out_path = os.path.join(SEGMENTS_DIR, "seg_08_conclusion.mp4")
    audio_path = os.path.join(AUDIO_DIR, "conclusion.mp3")
    a_dur = get_audio_duration(audio_path)
    pad = 0.8
    print(f"[*] Rendering Conclusion (Speech: {a_dur:.2f}s + {pad}s pad = {a_dur+pad:.2f}s)...")
    
    af_filter = f"apad=pad_dur={pad}"
    cmd = [
        ffmpeg, "-y",
        "-loop", "1", "-framerate", "30", "-i", CONCLUSION_FRAME,
        "-i", audio_path,
        "-af", af_filter,
        "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        "-shortest",
        out_path
    ]
    subprocess.run(cmd, check=True)
    print(f"    -> [✓] Done: {os.path.basename(out_path)} ({os.path.getsize(out_path):,} bytes)")
    return out_path

def main():
    t_start_all = time.time()
    
    # 1. Slides
    slide_paths = render_slides()
    
    # 2. Prototype
    proto_path = render_prototype()
    
    # 3. Conclusion
    conclusion_path = render_conclusion()
    
    # 4. Master Concatenation
    all_segments = slide_paths + [proto_path, conclusion_path]
    manifest_path = os.path.join(SEGMENTS_DIR, "master_concat_manifest.txt")
    with open(manifest_path, "w", encoding="utf-8") as f:
        for s in all_segments:
            f.write(f"file '{s.replace(os.sep, '/')}'\n")
            
    master_final = os.path.join(FINAL_DIR, "TeamBuilders-SIH26138.mp4")
    print("\n==========================================")
    print("STEP 4: FINAL CONCATENATION & EXPORT")
    print("==========================================")
    cmd_master = [
        ffmpeg, "-y",
        "-f", "concat", "-safe", "0",
        "-i", manifest_path,
        "-c", "copy",
        master_final
    ]
    subprocess.run(cmd_master, check=True)
    
    # Get master duration
    final_dur = get_audio_duration(master_final)
    mins = int(final_dur // 60)
    secs = int(final_dur % 60)
    print(f"\n[★] MASTER VIDEO CREATED: {master_final}")
    print(f"    -> Size: {os.path.getsize(master_final):,} bytes")
    print(f"    -> Total Duration: {final_dur:.2f}s ({mins} min {secs:02d} sec)")
    
    # Sync to all other required master locations
    import shutil
    targets = [
        os.path.join(BASE_DIR, "TeamBuilders-SIH26138.mp4"),
        os.path.join(BASE_DIR, "TeamBuilders-SIH-26138.mp4"),
        os.path.join(BASE_DIR, "SIH2026_GreenFleet_Quantum_Master_Demo.mp4")
    ]
    for dest in targets:
        shutil.copy2(master_final, dest)
        print(f"    -> Synced alias: {dest}")
        
    print(f"\n[✓] ALL STEPS COMPLETED IN {time.time()-t_start_all:.1f}s")

if __name__ == "__main__":
    main()
