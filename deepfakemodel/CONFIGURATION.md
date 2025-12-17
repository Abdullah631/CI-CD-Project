# Configuration Examples and Templates

This file contains various configuration templates for different scenarios.

## 1. QUICK TEST CONFIGURATION

For testing the pipeline quickly with minimal data:

```bash
# Quick preprocessing (extract only 1 frame per video)
python preprocess_videos.py \
    --dataset-path "a:\deepshit\FaceForensics++_C23" \
    --output-path "a:\deepshit\frames_dataset_quick" \
    --frames-per-video 1 \
    --frame-size 224 224

# Quick training (limit samples and epochs)
python train_model.py \
    --data-path "a:\deepshit\frames_dataset_quick" \
    --batch-size 16 \
    --epochs 3 \
    --learning-rate 0.001 \
    --val-split 0.2 \
    --limit-samples 50
```

**Expected Time**: 10-20 minutes total
**Result**: Test if the pipeline works correctly

## 2. PRODUCTION CONFIGURATION (HIGH QUALITY)

For maximum accuracy and model performance:

```bash
# Full preprocessing
python preprocess_videos.py \
    --dataset-path "a:\deepshit\FaceForensics++_C23" \
    --output-path "a:\deepshit\frames_dataset_full" \
    --frames-per-video 15 \
    --frame-size 224 224

# Full training
python train_model.py \
    --data-path "a:\deepshit\frames_dataset_full" \
    --batch-size 32 \
    --epochs 30 \
    --learning-rate 0.0001 \
    --val-split 0.2
```

**Expected Time**: 2-6 hours total
**Result**: Best accuracy model

## 3. GPU OPTIMIZED CONFIGURATION

For systems with powerful GPUs (8GB+ memory):

```bash
# Preprocessing (same as production)
python preprocess_videos.py \
    --frames-per-video 15

# Larger batches for faster training
python train_model.py \
    --batch-size 64 \
    --epochs 40 \
    --learning-rate 0.001

# Inference with higher batch size
python inference.py \
    --model-path "best_model.pt" \
    --input "directory" \
    --type batch
```

**Memory Required**: 8GB+ GPU VRAM
**Benefit**: Faster training (2-4x speedup)

## 4. CPU-ONLY CONFIGURATION

For systems without GPU:

```bash
# Preprocessing (can be slow, consider reducing frames)
python preprocess_videos.py \
    --frames-per-video 5 \
    --frame-size 224 224

# Much smaller batches for CPU
python train_model.py \
    --batch-size 4 \
    --epochs 10 \
    --learning-rate 0.001 \
    --val-split 0.2
```

**Note**: Training will take 5-10 hours
**Workaround**: Use cloud GPU (Google Colab, AWS, etc.)

## 5. LIMITED MEMORY CONFIGURATION (2-4GB GPU)

For systems with limited VRAM:

```bash
# Reduce preprocessing
python preprocess_videos.py \
    --frames-per-video 5

# Very small batches
python train_model.py \
    --data-path "a:\deepshit\frames_dataset" \
    --batch-size 8 \
    --epochs 15 \
    --learning-rate 0.0005 \
    --val-split 0.2
```

**Memory Usage**: 2-3GB GPU VRAM
**Trade-off**: Slower training, but still functional

## 6. INCREMENTAL DATASET CONFIGURATION

For processing dataset in smaller chunks:

```bash
# Process only Deepfakes (modify preprocess_videos.py)
# Comment out other fake_types in process_fake_sequences()

python preprocess_videos.py \
    --frames-per-video 10

# Repeat for each manipulation type:
# Face2Face, FaceSwap, NeuralTextures
```

**Advantage**: Can process dataset gradually
**Requirement**: Manual code modification

## 7. PRODUCTION PIPELINE CONFIGURATION

Automated end-to-end pipeline:

```bash
# Run complete pipeline with monitoring
python run_pipeline.py \
    --dataset-path "a:\deepshit\FaceForensics++_C23" \
    --output-path "a:\deepshit\frames_dataset_prod" \
    --frames-per-video 10 \
    --batch-size 32 \
    --epochs 25 \
    --learning-rate 0.001 \
    --val-split 0.2 \
    --test-image "path/to/test_image.jpg" \
    --test-video "path/to/test_video.mp4"
```

**Benefits**:

- Single command for entire workflow
- Automatic error handling
- Comprehensive logging
- Results summary

## 8. ANALYSIS-ONLY CONFIGURATION

For analyzing existing preprocessed data:

```bash
# Analyze dataset
python analyze_dataset.py \
    --data-path "a:\deepshit\frames_dataset" \
    --plot \
    --report

# Outputs:
# - dataset_stats.png (visualization)
# - dataset_report.txt (statistics)
```

**Use Case**: Verify preprocessing, check class distribution

## 9. INFERENCE-ONLY CONFIGURATION

For testing with trained model:

```bash
# Single image
python inference.py \
    --model-path "best_model.pt" \
    --input "path/to/image.jpg" \
    --type image \
    --output "predictions.json"

# Single video
python inference.py \
    --model-path "best_model.pt" \
    --input "path/to/video.mp4" \
    --type video \
    --output "video_predictions.json"

# Batch processing
python inference.py \
    --model-path "best_model.pt" \
    --input "path/to/images_folder" \
    --type batch \
    --output "batch_predictions.json"
```

**No training needed**: Just use existing model

## 10. COMPARATIVE EXPERIMENT CONFIGURATION

Run multiple training experiments:

```bash
# Experiment 1: Low learning rate
python train_model.py \
    --data-path "a:\deepshit\frames_dataset" \
    --learning-rate 0.0001 \
    --epochs 20

# Experiment 2: High learning rate
python train_model.py \
    --data-path "a:\deepshit\frames_dataset" \
    --learning-rate 0.01 \
    --epochs 20

# Experiment 3: Different batch size
python train_model.py \
    --data-path "a:\deepshit\frames_dataset" \
    --batch-size 64 \
    --epochs 20

# Compare results in training_history.png
```

**Purpose**: Find optimal hyperparameters

## Recommended Configurations by Hardware

### Entry Level (4GB GPU, i5)

```bash
python run_pipeline.py --quick --limit-samples 100
```

- Time: ~1 hour
- Result: Verify pipeline works

### Mid-Range (6GB GPU, i7)

```bash
python run_pipeline.py \
    --frames-per-video 5 \
    --batch-size 16 \
    --epochs 15
```

- Time: ~3-4 hours
- Result: Good quality model

### High-End (8GB+ GPU, i9/Ryzen 9)

```bash
python run_pipeline.py \
    --frames-per-video 15 \
    --batch-size 64 \
    --epochs 30
```

- Time: ~2-3 hours
- Result: Best quality model

## Environment Variables (Optional)

```bash
# Set to use specific GPU
set CUDA_VISIBLE_DEVICES=0

# Disable CUDA and use CPU
set CUDA_VISIBLE_DEVICES=""

# Set number of threads
set OMP_NUM_THREADS=8
```

## Docker Configuration (Optional)

For reproducible environments:

```dockerfile
FROM pytorch/pytorch:1.9.0-cuda10.2-cudnn7-runtime

WORKDIR /deepfake

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "run_pipeline.py"]
```

Build and run:

```bash
docker build -t deepfake-detector .
docker run --gpus all -v /path/to/data:/deepfake/data deepfake-detector
```

## Monitoring During Training

Add to train_model.py for real-time monitoring:

```python
# TensorBoard support (optional)
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('runs/experiment1')
writer.add_scalar('Training/Loss', train_loss, epoch)
writer.add_scalar('Training/Accuracy', train_acc, epoch)
writer.add_scalar('Validation/Loss', val_loss, epoch)
writer.add_scalar('Validation/Accuracy', val_acc, epoch)

# View with: tensorboard --logdir runs
```

## Performance Benchmarks

**Preprocessing (1000 videos, 10 frames each):**

- CPU: 3-4 hours
- GPU: N/A (CPU bound task)
- SSD: 1-2 hours
- HDD: 4-6 hours

**Training (50,000 frames, 20 epochs):**

- RTX 3080: 30 minutes
- RTX 2070: 1 hour
- GTX 1660: 2 hours
- CPU (i7): 4-6 hours

**Inference:**

- GPU: 1-5 ms per image
- CPU: 100-500 ms per image

## Tips for Optimal Results

1. **Start with quick test** to verify everything works
2. **Monitor training** - stop early if val loss plateaus
3. **Use augmentation** - helps with limited data
4. **Save checkpoints** - don't lose progress
5. **Version your experiments** - keep track of configurations
6. **Validate on held-out set** - prevent overfitting
7. **Compare metrics carefully** - accuracy isn't everything

---

**Last Updated**: December 2025
