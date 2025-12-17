# Deepfake Detection Model on FaceForensics++ Dataset

A complete deep learning pipeline for detecting deepfakes in the FaceForensics++ dataset. The project includes video preprocessing, model training, and inference capabilities.

## Project Structure

```
a:\deepshit/
├── FaceForensics++_C23/           # Original dataset
│   ├── manipulated_sequences/      # Fake videos (Deepfakes, Face2Face, FaceSwap, NeuralTextures)
│   └── original_sequences/         # Real videos (YouTube)
├── frames_dataset/                # Extracted frames (created after preprocessing)
│   ├── REAL/                      # Real images
│   └── FAKE/                      # Fake images
├── preprocess_videos.py           # Video preprocessing script
├── train_model.py                 # Model training script
├── inference.py                   # Inference/testing script
└── README.md                      # This file
```

## Features

### 1. Video Preprocessing (`preprocess_videos.py`)

- Extracts frames from all videos in the dataset
- Organizes frames into REAL and FAKE classes
- Resizes frames to 224x224 (configurable)
- Extracts evenly distributed frames from each video
- Supports concurrent processing

**Key Parameters:**

- `--frames-per-video`: Number of frames to extract per video (default: 10)
- `--frame-size`: Target frame resolution (default: 224 224)
- `--dataset-path`: Path to FaceForensics++ dataset
- `--output-path`: Output directory for extracted frames

### 2. Deepfake Detection Model (`train_model.py`)

- **Architecture**: ResNet50 with transfer learning
- **Base Network**: Pretrained ImageNet weights
- **Classification Head**: Custom layers for binary classification
- **Features**:
  - Data augmentation (flip, rotation, color jitter)
  - Early stopping with validation monitoring
  - Learning rate scheduling
  - Cross-entropy loss optimization
  - Comprehensive evaluation metrics

**Key Parameters:**

- `--batch-size`: Batch size for training (default: 32)
- `--epochs`: Number of training epochs (default: 20)
- `--learning-rate`: Learning rate (default: 0.001)
- `--val-split`: Validation split ratio (default: 0.2)
- `--limit-samples`: Limit samples per class for debugging (default: None)

**Model Evaluation:**

- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix
- Training history plots

### 3. Inference (`inference.py`)

- Single image prediction
- Single video prediction (aggregated across frames)
- Batch processing
- Confidence scores and probabilities
- JSON output export

**Key Parameters:**

- `--model-path`: Path to trained model checkpoint
- `--input`: Path to image, video, or directory
- `--type`: Input type (image, video, batch)
- `--output`: Output JSON file for results
- `--device`: Device to use (cuda or cpu)

## Installation

1. **Install Required Dependencies:**

```bash
pip install torch torchvision torchaudio
pip install opencv-python pillow
pip install scikit-learn matplotlib seaborn
pip install numpy tqdm
```

2. **For GPU Support (Optional but Recommended):**

```bash
# CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## Usage Guide

### Step 1: Preprocess Videos

Extract frames from all videos in the dataset:

```bash
python preprocess_videos.py --dataset-path "a:\deepshit\FaceForensics++_C23" \
                            --output-path "a:\deepshit\frames_dataset" \
                            --frames-per-video 10 \
                            --frame-size 224 224
```

**Expected Output:**

- Creates `frames_dataset/REAL/` with real frame images
- Creates `frames_dataset/FAKE/` with fake frame images
- Prints statistics about extracted frames

**Runtime Estimate:**

- With 1000+ videos: 1-4 hours (depends on system specs)
- To test the pipeline quickly, use `--frames-per-video 1`

### Step 2: Train the Model

Train the deepfake detection model:

```bash
python train_model.py --data-path "a:\deepshit\frames_dataset" \
                      --batch-size 32 \
                      --epochs 20 \
                      --learning-rate 0.001 \
                      --val-split 0.2
```

**For Quick Testing (with limited samples):**

```bash
python train_model.py --data-path "a:\deepshit\frames_dataset" \
                      --batch-size 16 \
                      --epochs 5 \
                      --limit-samples 100  # Limit to 100 samples per class
```

**Outputs:**

- `best_model.pt`: Trained model checkpoint
- `training_history.png`: Loss and accuracy plots
- Console: Training metrics and evaluation results

### Step 3: Run Inference

#### Single Image:

```bash
python inference.py --model-path "best_model.pt" \
                    --input "path/to/image.jpg" \
                    --type image \
                    --output predictions.json
```

#### Single Video:

```bash
python inference.py --model-path "best_model.pt" \
                    --input "path/to/video.mp4" \
                    --type video \
                    --output video_predictions.json
```

#### Batch Processing:

```bash
python inference.py --model-path "best_model.pt" \
                    --input "path/to/directory" \
                    --type batch \
                    --output batch_predictions.json
```

## Dataset Information

### FaceForensics++ C23 Version

**Fake Videos (Manipulated Sequences):**

- **Deepfakes**: 1000 videos (face replacement)
- **Face2Face**: 1000 videos (facial expression reenactment)
- **FaceSwap**: 1000 videos (face swapping)
- **NeuralTextures**: 1000 videos (neural texture-based manipulation)

**Real Videos (Original Sequences):**

- **YouTube**: 1000 original, unmanipulated videos

**Total:** 5000 videos split into:

- 1000 Real videos
- 4000 Fake videos (various manipulation types)

### Class Imbalance

- REAL: 1000 videos
- FAKE: 4000 videos
- Ratio: 1:4 (heavily imbalanced)

**Handling Imbalance:**

- Use weighted loss functions
- Adjust batch composition
- Use SMOTE or other resampling techniques
- Consider class weights in CrossEntropyLoss

## Model Architecture

```
ResNet50 Backbone (ImageNet pretrained)
    ↓
Adaptive Average Pooling
    ↓
Flatten
    ↓
Linear(2048, 512)
    ↓
ReLU + Dropout(0.5)
    ↓
Linear(512, 2)
    ↓
Softmax (REAL vs FAKE)
```

## Expected Performance

Based on FaceForensics++ benchmarks:

| Manipulation Type | Typical Accuracy |
| ----------------- | ---------------- |
| Deepfakes         | 92-98%           |
| Face2Face         | 85-95%           |
| FaceSwap          | 95-99%           |
| NeuralTextures    | 88-96%           |
| Overall Mixed     | 90-95%           |

_Note: Actual performance depends on training data quality and quantity_

## Troubleshooting

### Out of Memory (OOM) Error

```bash
# Reduce batch size
python train_model.py --batch-size 16

# Or use gradient accumulation (modify train_model.py)
```

### Slow Training

```bash
# Increase number of workers for data loading (in train_model.py)
# Modify: num_workers=4 to num_workers=8 or more
```

### CUDA Not Available

```bash
# Use CPU instead
python train_model.py --device cpu

# Or check CUDA installation
python -c "import torch; print(torch.cuda.is_available())"
```

### Missing Frames After Preprocessing

```bash
# Check video codec compatibility
# Some videos might be corrupted or use unsupported codecs
# The script logs warnings for failed videos
```

## Advanced Tips

### 1. Fine-tuning Different Layers

Modify `train_model.py` to freeze early layers:

```python
# Freeze early layers
for param in model.backbone.layer1.parameters():
    param.requires_grad = False
for param in model.backbone.layer2.parameters():
    param.requires_grad = False
```

### 2. Using Different Backbones

Replace ResNet50 with other architectures:

```python
# Use EfficientNet
model = models.efficientnet_b4(pretrained=True)

# Use Vision Transformer
model = models.vit_b_16(pretrained=True)
```

### 3. Class Weights for Imbalanced Data

```python
# In train_model.py, modify criterion:
class_weights = torch.tensor([1.0, 4.0])  # Weight fake class 4x higher
criterion = nn.CrossEntropyLoss(weight=class_weights)
```

## Evaluation Metrics Explanation

- **Accuracy**: Overall correctness of predictions
- **Precision**: Of all predicted FAKE videos, how many are actually FAKE
- **Recall**: Of all actual FAKE videos, how many did we correctly identify
- **F1-Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: True positives, False positives, True negatives, False negatives

## Common Issues and Solutions

| Issue                                     | Solution                              |
| ----------------------------------------- | ------------------------------------- |
| Very high training loss                   | Check learning rate, reduce to 0.0001 |
| Overfitting (high train acc, low val acc) | Increase dropout, add regularization  |
| Underfitting (low both train and val acc) | Train longer, increase model capacity |
| Model not improving after epoch 1         | Check data loading, verify labels     |
| Slow frame extraction                     | Reduce --frames-per-video to 5        |

## References

- **Paper**: [FaceForensics++: Learning to Detect Manipulated Facial Images](https://arxiv.org/abs/1901.08971)
- **Dataset**: https://github.com/ondyari/FaceForensics
- **ResNet**: [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)

## License

This project is for educational and research purposes. Make sure to comply with FaceForensics++ dataset terms of use.

## Contact & Support

For issues or questions:

1. Check the troubleshooting section
2. Review the log output carefully
3. Ensure all dependencies are installed correctly
4. Verify file paths are absolute and accessible

---

**Last Updated**: December 2025
**Python Version**: 3.8+
**PyTorch Version**: 1.9+
