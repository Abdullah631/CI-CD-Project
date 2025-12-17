import torch

print("="*50)
print("GPU CHECK")
print("="*50)
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print("\n✅ GPU is available and ready!")
else:
    print("\n❌ No GPU detected!")
    print("\nPossible reasons:")
    print("1. No NVIDIA GPU in your system")
    print("2. PyTorch installed without CUDA support")
    print("3. GPU drivers not installed/outdated")
    print("\nTo install PyTorch with CUDA:")
    print("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")
print("="*50)
