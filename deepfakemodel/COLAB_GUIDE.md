# Google Colab Training Guide

## Quick Setup (5 minutes)

### Step 1: Upload Notebook to Colab

1. Go to [Google Colab](https://colab.research.google.com/)
2. Click **File** → **Upload notebook**
3. Upload `Deepfake_Detection_Colab.ipynb`

### Step 2: Prepare Your Dataset

You have two options:

#### Option A: Upload to Google Drive (Recommended)

1. Upload `FaceForensics++_C23` folder to your Google Drive
2. Note the path (e.g., `/content/drive/MyDrive/FaceForensics++_C23`)

#### Option B: Upload Directly to Colab (Faster but temporary)

1. Zip your dataset: `FaceForensics++_C23.zip`
2. In Colab, upload and extract:

```python
from google.colab import files
uploaded = files.upload()  # Upload zip file
!unzip -q FaceForensics++_C23.zip
```

### Step 3: Enable GPU

1. Click **Runtime** → **Change runtime type**
2. Select **Hardware accelerator**: **GPU** (T4)
3. Click **Save**

### Step 4: Run the Notebook

1. Update `DATASET_PATH` in Cell 3 to match your path
2. Run cells sequentially: **Runtime** → **Run all**
3. Wait 2-4 hours for completion

## What the Notebook Does

### Cell-by-Cell Breakdown

| Cell | Description                        | Time      |
| ---- | ---------------------------------- | --------- |
| 1    | Check GPU availability             | 5 sec     |
| 2    | Install dependencies               | 30 sec    |
| 3    | Mount Google Drive                 | 10 sec    |
| 4    | Preprocess videos (extract frames) | 1-2 hours |
| 5    | Analyze dataset                    | 1 min     |
| 6    | Define model classes               | 5 sec     |
| 7    | Prepare data loaders               | 30 sec    |
| 8    | Train model (20 epochs)            | 30-60 min |
| 9    | Plot training history              | 5 sec     |
| 10   | Evaluate model                     | 2 min     |
| 11   | Test inference on samples          | 30 sec    |
| 12   | Save results to Drive              | 10 sec    |

**Total Time**: ~2-4 hours (mostly preprocessing and training)

## Key Configuration Options

### In Cell 3: Dataset Paths

```python
DATASET_PATH = '/content/drive/MyDrive/FaceForensics++_C23'  # Change this!
OUTPUT_PATH = '/content/frames_dataset'
MODEL_SAVE_PATH = '/content/drive/MyDrive/deepfake_model'
```

### In Cell 4: Preprocessing Settings

```python
frames_per_video=10  # Reduce to 5 for faster preprocessing
```

### In Cell 7: Batch Size

```python
BATCH_SIZE = 32  # Reduce to 16 or 8 if OOM errors
```

### In Cell 8: Training Epochs

```python
EPOCHS = 20  # Increase to 30 for better accuracy
```

## Expected Results

### After Preprocessing (Cell 4)

```
FAKE frames: 40,000
REAL frames: 10,000
Total frames: 50,000
```

### After Training (Cell 8)

```
Epoch 20/20
Train Loss: 0.1234 | Train Acc: 0.9567
Val Loss: 0.2345 | Val Acc: 0.9234
```

### Final Metrics (Cell 10)

```
Validation Accuracy: 92-95%
Precision: 90-94%
Recall: 91-95%
F1-Score: 90-94%
```

## Output Files (Saved to Google Drive)

```
/content/drive/MyDrive/deepfake_model/
├── best_model.pt              # Trained model (~200 MB)
├── training_history.png       # Loss/accuracy plots
├── confusion_matrix.png       # Evaluation visualization
└── sample_predictions.png     # Test predictions
```

## GPU Memory Usage

| Batch Size | GPU Memory | Speed   | Recommendation            |
| ---------- | ---------- | ------- | ------------------------- |
| 64         | ~8 GB      | Fastest | Not available on free T4  |
| 32         | ~4 GB      | Fast    | **Default** (works on T4) |
| 16         | ~2 GB      | Medium  | If OOM errors             |
| 8          | ~1 GB      | Slow    | Last resort               |

## Common Issues & Solutions

### Issue 1: Out of Memory

**Error**: `RuntimeError: CUDA out of memory`

**Solution**:

```python
# In Cell 7, reduce batch size
BATCH_SIZE = 16  # or 8
```

### Issue 2: Dataset Not Found

**Error**: `Directory not found: /content/drive/MyDrive/...`

**Solution**:

1. Verify Google Drive is mounted (Cell 3)
2. Check folder path in Drive
3. Update `DATASET_PATH` variable

### Issue 3: Disconnection During Training

**Problem**: Colab disconnects after long idle time

**Solutions**:

1. Keep Colab tab active
2. Run this JavaScript in browser console:

```javascript
function KeepAlive() {
  console.log("Keeping alive");
  document.querySelector("colab-toolbar-button#connect").click();
}
setInterval(KeepAlive, 60000);
```

3. Or use Colab Pro ($9.99/month) for longer sessions

### Issue 4: Slow Preprocessing

**Problem**: Preprocessing takes too long

**Solution**:

```python
# In Cell 4, reduce frames per video
preprocessor = VideoPreprocessor(DATASET_PATH, OUTPUT_PATH, frames_per_video=5)
```

### Issue 5: Low Accuracy

**Problem**: Model accuracy < 80%

**Solutions**:

1. Train for more epochs (30-40)
2. Reduce learning rate to 0.0001
3. Check data quality
4. Ensure proper class labels

## Optimization Tips

### Speed Up Preprocessing

```python
# In Cell 4, process fewer videos (for testing)
video_files = list(video_dir.glob('*.mp4'))[:100]  # Only first 100 videos
```

### Speed Up Training

```python
# In Cell 8, train on subset
train_dataset = torch.utils.data.Subset(train_dataset, range(10000))
val_dataset = torch.utils.data.Subset(val_dataset, range(2000))
```

### Increase Model Accuracy

```python
# In Cell 8, train longer with lower LR
EPOCHS = 30
optimizer = optim.Adam(model.parameters(), lr=0.0001, weight_decay=1e-5)
```

### Monitor Training in Real-Time

```python
# Add after Cell 8 training loop
from IPython.display import clear_output
# In training loop, add:
clear_output(wait=True)
# before printing epoch results
```

## Using Free vs Paid Colab

| Feature              | Free       | Colab Pro ($9.99/mo)       |
| -------------------- | ---------- | -------------------------- |
| GPU                  | T4 (16 GB) | T4/V100 (40 GB)            |
| Max Runtime          | 12 hours   | 24 hours                   |
| Idle Timeout         | 90 min     | 90 min (but can reconnect) |
| Background Execution | No         | Yes                        |
| Priority Access      | No         | Yes                        |
| Speed                | Medium     | Faster                     |

**Recommendation**: Free tier is sufficient for this project

## Step-by-Step Visual Guide

### 1. Enable GPU

![Runtime Menu](https://i.imgur.com/example.png)

1. Runtime → Change runtime type
2. Hardware accelerator → GPU
3. Save

### 2. Mount Google Drive

```python
from google.colab import drive
drive.mount('/content/drive')
# Click the link and authorize
```

### 3. Verify GPU

```python
!nvidia-smi
# Should show Tesla T4 or similar
```

### 4. Run All Cells

- Runtime → Run all
- Or press Shift+Enter for each cell

## Alternative: Quick Test Run

For a quick test without full dataset:

```python
# In Cell 4, add limit
video_files = list(video_dir.glob('*.mp4'))[:10]  # Only 10 videos

# In Cell 7, reduce dataset
dataset = FaceForensicsDataset(OUTPUT_PATH, transform=train_transform)
dataset = torch.utils.data.Subset(dataset, range(100))  # Only 100 samples

# In Cell 8, quick training
EPOCHS = 3
```

**This completes in ~10 minutes** for testing the pipeline.

## Download Results

### Method 1: Direct Download (Small Files)

```python
from google.colab import files
files.download('/content/drive/MyDrive/deepfake_model/best_model.pt')
```

### Method 2: Via Google Drive (Recommended)

1. Open Google Drive in browser
2. Navigate to `deepfake_model` folder
3. Right-click → Download

### Method 3: Using gdown (For Scripts)

```bash
# Get file ID from Google Drive share link
pip install gdown
gdown --id YOUR_FILE_ID
```

## Using Trained Model Locally

After downloading `best_model.pt`:

```python
import torch
import torchvision.models as models
import torch.nn as nn

# Define model architecture (same as Colab)
class DeepfakeDetector(nn.Module):
    def __init__(self, pretrained=False):
        super(DeepfakeDetector, self).__init__()
        self.backbone = models.resnet50(pretrained=pretrained)
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )

    def forward(self, x):
        return self.backbone(x)

# Load model
model = DeepfakeDetector(pretrained=False)
checkpoint = torch.load('best_model.pt', map_location='cpu')
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

print(f"Model loaded! Best validation accuracy: {checkpoint['val_acc']:.4f}")

# Use for inference (see inference.py)
```

## Monitoring Progress

### Check Training Progress

```python
# After each epoch, you'll see:
Epoch 1/20
Training: 100%|██████████| 1250/1250 [03:45<00:00, 5.55it/s]
Train Loss: 0.4523 | Train Acc: 0.8234
Validating: 100%|██████████| 313/313 [00:32<00:00, 9.72it/s]
Val Loss: 0.3456 | Val Acc: 0.8567
✓ Model saved (Val Loss: 0.3456)
```

### Check GPU Usage

```python
!nvidia-smi
# Shows GPU utilization, memory usage
```

### Check Disk Usage

```python
!df -h
# Ensure enough space for frames (~20 GB)
```

## Best Practices

1. **Save Frequently**: Results auto-save to Drive
2. **Monitor Memory**: Watch for OOM warnings
3. **Check Plots**: Review training curves for overfitting
4. **Validate Results**: Check confusion matrix
5. **Test Samples**: Verify predictions make sense
6. **Keep Logs**: Download cell outputs for reference
7. **Version Models**: Save different checkpoints

## Colab Keyboard Shortcuts

- `Ctrl+Enter`: Run cell
- `Shift+Enter`: Run cell and move to next
- `Ctrl+M B`: Insert cell below
- `Ctrl+M A`: Insert cell above
- `Ctrl+M D`: Delete cell
- `Ctrl+M Z`: Undo delete cell

## Next Steps After Training

1. **Download Model**: Save to local machine
2. **Test Locally**: Use `inference.py` script
3. **Deploy**: Create API or web app
4. **Fine-tune**: Train on specific deepfake types
5. **Optimize**: Quantize for faster inference
6. **Share**: Export notebook or model

---

## Quick Reference Commands

```python
# Check GPU
!nvidia-smi

# Check disk space
!df -h

# Install package
!pip install package_name

# Download file
from google.colab import files
files.download('file.pt')

# Upload file
from google.colab import files
uploaded = files.upload()

# Mount Drive
from google.colab import drive
drive.mount('/content/drive')

# List files
!ls -lh /content/drive/MyDrive/

# Check Python version
!python --version

# Check PyTorch version
import torch; print(torch.__version__)
```

---

**Time Budget**:

- Setup: 5 minutes
- Preprocessing: 1-2 hours
- Training: 30-60 minutes
- Evaluation: 5 minutes
- **Total: 2-4 hours**

**Result**: Trained model with 90-95% accuracy ready for deployment!

Good luck with your training! 🚀
