import torch
from collections import defaultdict
from pathlib import Path
import argparse


def summarize_model(model):
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    by_module = defaultdict(int)
    for name, p in model.named_parameters():
        top = name.split('.')[0]
        by_module[top] += p.numel()

    print(f"Device: {next(model.parameters()).device}")
    print(f"Total params: {total_params:,}")
    print(f"Trainable params: {trainable_params:,}\n")

    print("Parameter count by top-level module:")
    for mod, cnt in sorted(by_module.items(), key=lambda x: -x[1]):
        print(f"  {mod}: {cnt:,}")


def load_and_report(checkpoint_path: str):
    ckpt_path = Path(checkpoint_path)
    if not ckpt_path.exists():
        print(f"Checkpoint not found: {checkpoint_path}")
        return

    # Import model class from train_model
    import sys
    sys.path.insert(0, str(ckpt_path.parent))
    try:
        from train_model import DeepfakeDetector
    except Exception as e:
        print(f"Failed to import DeepfakeDetector from train_model.py: {e}")
        return

    # Load checkpoint to CPU first
    map_loc = torch.device('cpu')
    checkpoint = torch.load(str(ckpt_path), map_location=map_loc)

    model = DeepfakeDetector(pretrained=False)
    try:
        model.load_state_dict(checkpoint.get('model_state_dict', checkpoint), strict=False)
    except Exception as e:
        print(f"Warning: loading state_dict with strict=False failed: {e}")

    # Move to device if available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    print(f"Loaded checkpoint: {checkpoint_path}")

    # Summary
    summarize_model(model)

    # Checkpoint contents
    print("\nCheckpoint keys:")
    if isinstance(checkpoint, dict):
        for k in checkpoint.keys():
            print(f"  {k}")

        if 'history' in checkpoint:
            hist = checkpoint['history']
            print("\nTraining history keys and lengths:")
            for hk, hv in hist.items():
                try:
                    print(f"  {hk}: {len(hv)} entries")
                except Exception:
                    print(f"  {hk}: (non-iterable) {type(hv)}")
    else:
        print("  (checkpoint is not a dict; raw object)\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Print model info from checkpoint')
    parser.add_argument('--checkpoint', '-c', type=str, default='best_model.pt')
    args = parser.parse_args()

    load_and_report(args.checkpoint)
