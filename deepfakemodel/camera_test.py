import argparse
import time
import csv
from pathlib import Path
import cv2
from PIL import Image
import torch
from inference import DeepfakeInference
import socket
import os
import sys


def main():
    parser = argparse.ArgumentParser(description='Camera snapshot tester for deepfake model')
    parser.add_argument('--model-path', required=True, help='Path to trained model checkpoint (best_model.pt)')
    parser.add_argument('--device', choices=['cuda','cpu'], default='cuda', help='Device')
    parser.add_argument('--camera', type=str, default='auto', help='"auto", camera index (e.g. 0) or camera URL (e.g. http://192.168.1.10:4747/video)')
    parser.add_argument('--auto-droid-scan', action='store_true', default=True, help='Scan local subnet for DroidCam stream if no local camera found')
    parser.add_argument('--interval', type=float, default=2.0, help='Seconds between snapshots')
    parser.add_argument('--max-shots', type=int, default=20, help='Maximum number of snapshots to capture')
    parser.add_argument('--output-dir', default='camera_snapshots', help='Directory to save snapshots')
    parser.add_argument('--output-csv', default='camera_predictions.csv', help='CSV file for predictions')
    parser.add_argument('--show', action='store_true', help='Show camera window with overlay')
    args = parser.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Initialize inference (loads model)
    inference = DeepfakeInference(args.model_path, device=args.device)
    model = inference.model
    transform = inference.transform
    class_names = inference.class_names
    device = inference.device

    def _try_local_indices(max_idx=5):
        for i in range(0, max_idx+1):
            cap = cv2.VideoCapture(i)
            if cap is None or not cap.isOpened():
                try:
                    cap.release()
                except Exception:
                    pass
                continue
            return i
        return None

    def _local_ip():
        # Get the local IP used to reach the internet
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(('8.8.8.8', 80))
            ip = s.getsockname()[0]
        except Exception:
            ip = None
        finally:
            s.close()
        return ip

    def _scan_for_droidcam(base_ip, port=4747, max_hosts=16, timeout=0.35):
        # Probe a small set of hosts on the same /24 subnet
        if base_ip is None:
            return None
        parts = base_ip.split('.')
        if len(parts) != 4:
            return None
        prefix = '.'.join(parts[:3])
        # try hosts 2..(1+max_hosts)
        for i in range(2, 2 + max_hosts):
            host = f"{prefix}.{i}"
            try:
                with socket.create_connection((host, port), timeout=timeout):
                    # quick tcp connect success
                    return f'http://{host}:{port}/video'
            except Exception:
                continue
        return None

    camera_source = None
    cam_arg = args.camera

    if cam_arg == 'auto' or cam_arg is None:
        # First try local device indexes
        idx = _try_local_indices(max_idx=5)
        if idx is not None:
            camera_source = idx
            print(f'Using local camera index {idx}')
        else:
            # Try environment var
            env_url = os.environ.get('DROIDCAM_URL')
            if env_url:
                camera_source = env_url
                print(f'Using DROIDCAM_URL from env: {env_url}')
            elif args.auto_droid_scan:
                base = _local_ip()
                url = _scan_for_droidcam(base, max_hosts=16)
                if url:
                    camera_source = url
                    print(f'Found DroidCam stream at {url}')
    else:
        try:
            camera_source = int(cam_arg)
        except Exception:
            camera_source = cam_arg

    if camera_source is None:
        print('No camera found automatically; please provide --camera index or URL')
        sys.exit(1)

    cap = cv2.VideoCapture(camera_source)
    if not cap.isOpened():
        print('Cannot open camera', args.camera)
        return

    rows = []
    shots = 0
    last_time = 0.0

    print('Press q to quit early')

    try:
        while shots < args.max_shots:
            ret, frame = cap.read()
            if not ret:
                print('Empty frame, retrying...')
                time.sleep(0.1)
                continue

            now = time.time()
            if now - last_time < args.interval:
                # optionally show live preview without processing
                if args.show:
                    cv2.imshow('camera', frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                continue

            last_time = now

            # Convert BGR to RGB and to PIL
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(frame_rgb)

            # Preprocess and predict
            input_tensor = transform(pil).unsqueeze(0).to(device)
            with torch.no_grad():
                output = model(input_tensor)
                probs = torch.softmax(output, dim=1)
                pred = int(probs.argmax(dim=1).item())
                conf = float(probs[0, pred].item())

            label = class_names[pred]

            # Save snapshot
            filename = out_dir / f'shot_{shots:03d}_{label}_{conf:.3f}.jpg'
            cv2.imwrite(str(filename), frame)

            rows.append([str(filename), label, conf])
            shots += 1

            # Overlay and show
            if args.show:
                overlay = frame.copy()
                text = f'{label} ({conf:.2f})'
                cv2.putText(overlay, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0,255,0) if label=='REAL' else (0,0,255), 2)
                cv2.imshow('camera', overlay)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            print(f'Saved {filename} -> {label} ({conf:.3f})')

    finally:
        cap.release()
        cv2.destroyAllWindows()

    # Save CSV
    with open(args.output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['filepath','pred','confidence'])
        writer.writerows(rows)

    print('Done. Saved', len(rows), 'snapshots and predictions to', args.output_csv)


if __name__ == '__main__':
    main()
