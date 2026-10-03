import os
import cv2
import numpy as np
import subprocess
import imageio_ffmpeg

def clean_watermark(frame):
    mask = np.zeros(frame.shape[:2], dtype=np.uint8)
    cv2.rectangle(mask, (1128, 568), (1194, 634), 255, -1)
    return cv2.inpaint(frame, mask, 5, cv2.INPAINT_TELEA)

def main():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    input_video = 'Camera_moving_through_dark_theatre_20261003221838.mp4'
    cap = cv2.VideoCapture(input_video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f'Starting processing: {width}x{height} @ {fps} fps')
    
    # 1. Prepare Main Page reference image
    main_img = cv2.imread('temp_frames/main_page_clean.jpg')
    mh, mw, _ = main_img.shape
    scale = width / mw
    scaled_h = int(mh * scale)
    resized_main = cv2.resize(main_img, (width, scaled_h), interpolation=cv2.INTER_LANCZOS4)
    canvas_main = np.zeros((height, width, 3), dtype=np.uint8)
    y_offset = (height - scaled_h) // 2
    canvas_main[y_offset:y_offset+scaled_h, :] = resized_main
    cv2.imwrite('theatron_main_page_hd.jpg', canvas_main)
    print('HD main page frame saved as theatron_main_page_hd.jpg')

    # Read all frames up to frame 188
    # Frame 188 is where curtains are open and flare is sweeping
    cutoff_frame = 188
    frames_clean = []
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    for idx in range(cutoff_frame):
        ret, frame = cap.read()
        if not ret:
            break
        cleaned = clean_watermark(frame)
        frames_clean.append(cleaned)
        if idx % 40 == 0:
            print(f'Cleaned up to frame {idx}/{cutoff_frame}')
            
    cap.release()
    print(f'Cleaned {len(frames_clean)} intro frames.')

    # ---- Export 1: theatron_curtain_opening_clean.mp4 (for landing page intro) ----
    temp_raw_intro = 'temp_intro_raw.mp4'
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out1 = cv2.VideoWriter(temp_raw_intro, fourcc, fps, (width, height))
    for f in frames_clean:
        out1.write(f)
    out1.release()

    # Mux with trimmed audio
    intro_duration = len(frames_clean) / fps
    final_intro = 'theatron_curtain_opening_clean.mp4'
    cmd1 = [
        ffmpeg_exe, '-y',
        '-i', temp_raw_intro,
        '-ss', '0', '-t', str(intro_duration),
        '-i', 'audio_track.mp3',
        '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart',
        '-af', f'afade=t=out:st={intro_duration - 0.5:.2f}:d=0.5',
        final_intro
    ]
    subprocess.run(cmd1, check=True)
    print(f'Generated {final_intro}')

    # ---- Export 2: theatron_landing_animation_complete.mp4 (full animation: intro -> transition -> main page) ----
    all_frames = list(frames_clean)
    last_frame = frames_clean[-1]

    # Transition: 24 frames (~1.0 sec)
    trans_steps = 24
    for i in range(trans_steps):
        t = (i + 1) / float(trans_steps)
        # Zoom intro slightly
        zoom_f = 1.0 + 0.15 * t
        nw, nh = int(width * zoom_f), int(height * zoom_f)
        zf = cv2.resize(last_frame, (nw, nh))
        x0, y0 = (nw - width) // 2, (nh - height) // 2
        f_crop = zf[y0:y0+height, x0:x0+width]

        # Zoom main slightly from 0.96 to 1.0
        zoom_m = 0.96 + 0.04 * t
        mw_z, mh_z = int(width * zoom_m), int(height * zoom_m)
        zm = cv2.resize(canvas_main, (mw_z, mh_z))
        if zoom_m < 1.0:
            m_canvas = np.zeros_like(canvas_main)
            mx0, my0 = (width - mw_z) // 2, (height - mh_z) // 2
            m_canvas[my0:my0+mh_z, mx0:mx0+mw_z] = zm
        else:
            m_canvas = zm

        # Smoothstep blending
        alpha = t * t * (3 - 2 * t)
        blended = cv2.addWeighted(f_crop, 1.0 - alpha, m_canvas, alpha, 0)

        # Warm amber theatrical bloom peaking in middle of transition
        flare_str = np.sin(t * np.pi) * 0.22
        if flare_str > 0:
            flare = np.full_like(blended, (18, 32, 65), dtype=np.uint8)
            blended = cv2.addWeighted(blended, 1.0, flare, flare_str, 0)

        all_frames.append(blended)

    # Hold on Main Page for 96 frames (4 seconds) with subtle atmospheric breath
    hold_frames = 96
    for i in range(hold_frames):
        # Subtle gentle pulse / cinema light shimmer
        shimmer = 1.0 + 0.015 * np.sin(i * 0.1)
        shimmer_frame = cv2.convertScaleAbs(canvas_main, alpha=shimmer, beta=0)
        all_frames.append(shimmer_frame)

    temp_raw_full = 'temp_full_raw.mp4'
    out2 = cv2.VideoWriter(temp_raw_full, fourcc, fps, (width, height))
    for f in all_frames:
        out2.write(f)
    out2.release()

    total_full_duration = len(all_frames) / fps
    final_full = 'theatron_landing_animation_complete.mp4'
    # Use audio from original video, looping or padding with theatrical reverb fade
    cmd2 = [
        ffmpeg_exe, '-y',
        '-i', temp_raw_full,
        '-i', 'audio_track.mp3',
        '-filter_complex', f'[1:a]apad=pad_dur={total_full_duration}[aout];[aout]afade=t=out:st={total_full_duration - 1.5:.2f}:d=1.5[afinal]',
        '-map', '0:v', '-map', '[afinal]',
        '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart',
        final_full
    ]
    subprocess.run(cmd2, check=True)
    print(f'Generated {final_full} (duration: {total_full_duration:.2f}s)')

    # Clean up temp files
    if os.path.exists(temp_raw_intro): os.remove(temp_raw_intro)
    if os.path.exists(temp_raw_full): os.remove(temp_raw_full)
    print('Processing complete!')

if __name__ == '__main__':
    main()
