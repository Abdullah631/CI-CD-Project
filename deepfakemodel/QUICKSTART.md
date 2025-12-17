# Quick Start Guide - Deepfake Detection Model

This guide will get you up and running in 10 minutes!

## Prerequisites Check

```bash
# Verify Python version (3.8+)
python --version

# Check if pip is available
pip --version
```

## Installation (5 minutes)

### Option 1: CPU Only (Slower but works everywhere)

```bash
pip install -r requirements.txt
```

### Option 2: With GPU Support (Recommended)

```bash
# For CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt

# For CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

## Quick Test Run (3 minutes)

### Test 1: Verify Installation

```bash
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'GPU available: {torch.cuda.is_available()}')"
```

### Test 2: Quick Preprocessing (Small Dataset)

Extract frames from just a few videos to test the pipeline:

```bash
python preprocess_videos.py --dataset-path "a:\deepshit\FaceForensics++_C23" \
                            --output-path "a:\deepshit\frames_dataset" \
                            --frames-per-video 2  # Only 2 frames per video for testing
```

**Expected Time**: 5-10 minutes

### Test 3: Quick Model Training

```bash
python train_model.py --data-path "a:\deepshit\frames_dataset" \
                      --batch-size 16 \
                      --epochs 3 \
                      --limit-samples 50  # Only 50 samples per class
```

**Expected Time**: 2-5 minutes (on GPU), 10-15 minutes (on CPU)

## Full Pipeline (30 minutes - 4 hours depending on system)

### Step 1: Complete Preprocessing

```bash
python preprocess_videos.py --dataset-path "a:\deepshit\FaceForensics++_C23" \
                            --output-path "a:\deepshit\frames_dataset" \
                            --frames-per-video 10 \
                            --frame-size 224 224
```

⏱️ **Time**: 1-3 hours (depending on disk speed and CPU)

### Step 2: Full Training

```bash
python train_model.py --data-path "a:\deepshit\frames_dataset" \
                      --batch-size 32 \
                      --epochs 20 \
                      --learning-rate 0.001
```

⏱️ **Time**: 30 minutes - 2 hours (depending on GPU availability)

### Step 3: Test Inference

```bash
# Test on a single image
python inference.py --model-path "best_model.pt" \
                    --input "path/to/test_image.jpg" \
                    --type image

# Or test on a video
python inference.py --model-path "best_model.pt" \
                    --input "path/to/test_video.mp4" \
                    --type video
```

## Expected Outputs

After successful runs, you'll have:

```
a:\deepshit/
├── frames_dataset/
│   ├── REAL/
│   │   ├── 000.mp4_frame_000.jpg
│   │   ├── 000.mp4_frame_001.jpg
│   │   └── ... (thousands of images)
│   └── FAKE/
│       ├── 000_003.mp4_frame_000.jpg
│       ├── 000_003.mp4_frame_001.jpg
│       └── ... (thousands of images)
├── best_model.pt           # Trained model
├── training_history.png    # Loss/accuracy plots
└── predictions.json        # Inference results
```

## Monitoring Progress

### During Preprocessing

```
Processing Deepfakes...
Processing FAKE sequences... 100%|████████| 1000/1000
Processing FACE2FACE...
...
Preprocessing completed!
Total frames extracted: 50000
FAKE frames: 40000
REAL frames: 10000
```

### During Training

```
Epoch 1/20
Training: 100%|████████| 100/100
Train Loss: 0.6234 | Train Acc: 0.6250
Val Loss: 0.5123 | Val Acc: 0.7234
...
```

### After Training

```
Final Evaluation on Validation Set:
Validation Accuracy: 0.9234
Precision: 0.9156
Recall: 0.9345
F1-Score: 0.9250
```

## Troubleshooting Quick Fixes

| Problem                   | Quick Fix                              |
| ------------------------- | -------------------------------------- |
| "No module named 'torch'" | Run: `pip install torch torchvision`   |
| Out of Memory             | Reduce batch size: `--batch-size 8`    |
| Very slow on CPU          | Install CUDA: See installation section |
| Videos not processing     | Check video format (should be .mp4)    |
| "Frame not found"         | Verify dataset path is correct         |

## Performance Expectations

| Task                      | GPU (RTX3080) | GPU (RTX2060) | CPU (i7) |
| ------------------------- | ------------- | ------------- | -------- |
| Preprocessing 5000 videos | 1.5 hours     | 3 hours       | 4+ hours |
| Training (20 epochs)      | 30 min        | 1 hour        | 4+ hours |
| Single inference          | <1 sec        | <1 sec        | 2-5 sec  |

## Next Steps

After getting familiar with the basic pipeline:

1. **Experiment with hyperparameters:**

   - Try different learning rates: 0.0001, 0.001, 0.01
   - Adjust batch sizes: 8, 16, 32, 64
   - Change number of epochs: 10, 20, 30

2. **Try different models:**

   - EfficientNet (faster, better accuracy)
   - Vision Transformers (state-of-the-art)
   - Ensemble methods (combine multiple models)

3. **Analyze results:**

   - Check confusion matrix for common mistakes
   - Identify hard cases
   - Fine-tune on specific manipulation types

4. **Optimize for production:**
   - Quantize model for faster inference
   - Use ONNX for cross-platform deployment
   - Create web API with Flask/FastAPI

## Getting Help

1. **Check logs carefully** - Most errors are explained in the output
2. **Verify file paths** - Use absolute paths, avoid spaces in names
3. **Check disk space** - Need ~50-100GB for full dataset + extracted frames
4. **Update PyTorch** - New versions often fix compatibility issues

## GPU Memory Requirements

| Model    | Batch Size | GPU Memory |
| -------- | ---------- | ---------- |
| ResNet50 | 32         | 8GB        |
| ResNet50 | 16         | 4GB        |
| ResNet50 | 8          | 2GB        |

If you have less memory, reduce batch size accordingly.

## Quick Commands Reference

```bash
# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"

# Check installed packages
pip list | grep torch

# Quick install all dependencies
pip install -r requirements.txt

# Run preprocessing
python preprocess_videos.py --frames-per-video 10

# Run training
python train_model.py --epochs 20 --batch-size 32

# Run inference
python inference.py --model-path "best_model.pt" --input "image.jpg" --type image

# Check model size
python -c "import torch; m=torch.load('best_model.pt'); print(sum(p.numel() for p in m['model_state_dict'].values()))"
```

---

**Total Setup Time**: ~15 minutes for installation + testing
**Full Pipeline Time**: 2-6 hours depending on system
**Ready to go!** 🚀
