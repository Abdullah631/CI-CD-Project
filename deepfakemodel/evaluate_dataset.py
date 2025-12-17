import argparse
from pathlib import Path
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import csv
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SimpleImageDataset(Dataset):
    def __init__(self, files, labels, transform=None):
        self.files = files
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        path = self.files[idx]
        label = self.labels[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, label, str(path)


class DeepfakeDetector(nn.Module):
    def __init__(self, pretrained=True, num_classes=2):
        super(DeepfakeDetector, self).__init__()
        self.backbone = models.resnet50(pretrained=pretrained)
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)


def collect_files(data_path: Path):
    real_dir = data_path / 'REAL'
    fake_dir = data_path / 'FAKE'
    files = []
    labels = []
    if real_dir.exists():
        for p in sorted(real_dir.glob('*.jpg')) + sorted(real_dir.glob('*.png')):
            files.append(p)
            labels.append(0)
    if fake_dir.exists():
        for p in sorted(fake_dir.glob('*.jpg')) + sorted(fake_dir.glob('*.png')):
            files.append(p)
            labels.append(1)
    return files, labels


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', required=True)
    parser.add_argument('--model-path', default='best_model.pt')
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--num-workers', type=int, default=0)
    parser.add_argument('--output-csv', default='predictions.csv')
    args = parser.parse_args()

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f'Using device: {device}')

    data_path = Path(args.data_path)
    files, labels = collect_files(data_path)
    if len(files) == 0:
        logger.error('No images found in dataset path')
        return

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    dataset = SimpleImageDataset(files, labels, transform=transform)
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=False, num_workers=args.num_workers, pin_memory=(device.type=='cuda'))

    model = DeepfakeDetector(pretrained=False)
    ckpt = torch.load(args.model_path, map_location=device)
    model.load_state_dict(ckpt['model_state_dict'])
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []
    rows = []

    softmax = nn.Softmax(dim=1)
    with torch.no_grad():
        for batch in loader:
            images, labs, paths = batch
            images = images.to(device)
            outputs = model(images)
            probs = softmax(outputs)
            preds = probs.argmax(dim=1).cpu().numpy()
            probs_fake = probs[:,1].cpu().numpy()
            labs_np = labs.numpy()
            for pth, lab, pred, prob in zip(paths, labs_np, preds, probs_fake):
                rows.append((pth, int(lab), int(pred), float(prob)))
                all_preds.append(int(pred))
                all_labels.append(int(lab))

    # Metrics
    acc = accuracy_score(all_labels, all_preds)
    prec = precision_score(all_labels, all_preds)
    rec = recall_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)

    logger.info(f'Accuracy: {acc:.4f}')
    logger.info(f'Precision: {prec:.4f}')
    logger.info(f'Recall: {rec:.4f}')
    logger.info(f'F1-score: {f1:.4f}')
    logger.info(f'Confusion matrix:\n{cm}')

    # Save CSV
    out_path = Path(args.output_csv)
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['filepath','label','pred','prob_fake'])
        writer.writerows(rows)

    logger.info(f'Predictions saved to {out_path}')

if __name__ == '__main__':
    main()
