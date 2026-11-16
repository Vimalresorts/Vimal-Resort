"""Render short cinematic 'space films' from real photos and 360° panoramas.

Shots:
  photo: slow push/pan between two crop rects of a high-res photo (sub-pixel, no jitter)
  pano : rectilinear camera glide inside an equirectangular 360° photo
Shots are joined with crossfades and encoded with ffmpeg.

Usage: python3 -I films.py <spec.json> <out_dir>
"""
import json, sys, os, subprocess, math
import numpy as np
import cv2

FPS = 30
XF = 0.8  # crossfade seconds


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))


def load(path, cache={}):
    if path not in cache:
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        if img is None:
            raise SystemExit(f'cannot read {path}')
        cache[path] = img
    return cache[path]


def photo_frame(img, W, H, a, b, t):
    """a,b = (cx, cy, zoom) in normalized coords; zoom 1 = largest crop of output aspect."""
    h, w = img.shape[:2]
    k = ease(t)
    cx = a[0] + (b[0] - a[0]) * k
    cy = a[1] + (b[1] - a[1]) * k
    z = a[2] * (b[2] / a[2]) ** k
    asp = W / H
    cw = min(w, h * asp) / z
    ch = cw / asp
    x0 = min(max(cx * w - cw / 2, 0), w - cw)
    y0 = min(max(cy * h - ch / 2, 0), h - ch)
    s = W / cw
    M = np.array([[s, 0, -x0 * s], [0, s, -y0 * s]], dtype=np.float64)
    # pre-shrink huge sources once per frame scale band for quality (area filter)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


def pano_frame(img, W, H, a, b, t):
    """a,b = (yaw_deg, pitch_deg, hfov_deg)."""
    k = ease(t)
    yaw = math.radians(a[0] + (b[0] - a[0]) * k)
    pitch = math.radians(a[1] + (b[1] - a[1]) * k)
    hfov = math.radians(a[2] + (b[2] - a[2]) * k)
    ph, pw = img.shape[:2]
    f = (W / 2) / math.tan(hfov / 2)
    xs = (np.arange(W) - W / 2 + 0.5) / f
    ys = (np.arange(H) - H / 2 + 0.5) / f
    X, Y = np.meshgrid(xs, ys)
    Z = np.ones_like(X)
    # rotate: pitch around x, then yaw around y
    cp, sp = math.cos(pitch), math.sin(pitch)
    Y2 = Y * cp - Z * sp
    Z2 = Y * sp + Z * cp
    cy_, sy_ = math.cos(yaw), math.sin(yaw)
    X3 = X * cy_ + Z2 * sy_
    Z3 = -X * sy_ + Z2 * cy_
    lon = np.arctan2(X3, Z3)
    lat = np.arctan2(-Y2, np.sqrt(X3 ** 2 + Z3 ** 2))
    mx = ((lon / (2 * math.pi) + 0.5) * pw).astype(np.float32)
    my = ((0.5 - lat / math.pi) * ph).astype(np.float32)
    return cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_WRAP)


def render(spec, out_path, W, H, crf):
    shots = spec['shots']
    total = sum(s['dur'] for s in shots) - XF * (len(shots) - 1)
    n = int(round(total * FPS))
    ff = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-vf', 'eq=contrast=1.04:saturation=1.07,unsharp=3:3:0.35',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out_path,
    ], stdin=subprocess.PIPE)
    starts = []
    acc = 0.0
    for s in shots:
        starts.append(acc)
        acc += s['dur'] - XF

    def shot_img(i, tt):
        s = shots[i]
        img = load(s['src'])
        t = tt / s['dur']
        key = 'm' if W < H else 'd'
        a, b = s.get(key + 'a', s['a']), s.get(key + 'b', s['b'])
        return photo_frame(img, W, H, a, b, t) if s['kind'] == 'photo' else pano_frame(img, W, H, a, b, t)

    for fi in range(n):
        t = fi / FPS
        active = [i for i, st in enumerate(starts) if st <= t < st + shots[i]['dur']]
        frame = None
        for i in active:
            im = shot_img(i, t - starts[i]).astype(np.float32)
            if frame is None:
                frame = im
            else:
                w = (t - starts[i]) / XF
                frame = frame * (1 - w) + im * w
        ff.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()


def main():
    spec_path, out_dir = sys.argv[1], sys.argv[2]
    specs = json.load(open(spec_path))
    only = sys.argv[3:] or None
    for name, spec in specs.items():
        if only and name not in only:
            continue
        render(spec, os.path.join(out_dir, f'{name}-lg.mp4'), 1920, 1080, 21)
        render(spec, os.path.join(out_dir, f'{name}-sm.mp4'), 720, 1280, 25)
        print('done', name, flush=True)


if __name__ == '__main__':
    main()
