"""
Deepfake Detection Model using Deep Learning
Binary classification: REAL vs FAKE
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
import torchvision.models as models
from pathlib import Path
import numpy as np
import logging
import os
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FaceForensicsDataset(Dataset):
    """Custom dataset for loading image frames from FaceForensics++"""
    
    def __init__(self, data_path, transform=None, limit_samples=None):
        """
        Initialize dataset.
        
        Args:
            data_path: Path to dataset with REAL and FAKE subdirectories
            transform: Image transformations
            limit_samples: Limit number of samples per class (for debugging)
        """
        self.data_path = Path(data_path)
        self.transform = transform
        self.images = []
        self.labels = []
        
        # Load REAL images (label 0)
        real_dir = self.data_path / 'REAL'
        if real_dir.exists():
            real_images = list(real_dir.glob('*.jpg')) + list(real_dir.glob('*.png'))
            if limit_samples:
                real_images = real_images[:limit_samples]
            self.images.extend(real_images)
            self.labels.extend([0] * len(real_images))
            logger.info(f"Loaded {len(real_images)} REAL images")
        
        # Load FAKE images (label 1)
        fake_dir = self.data_path / 'FAKE'
        if fake_dir.exists():
            fake_images = list(fake_dir.glob('*.jpg')) + list(fake_dir.glob('*.png'))
            if limit_samples:
                fake_images = fake_images[:limit_samples]
            self.images.extend(fake_images)
            self.labels.extend([1] * len(fake_images))
            logger.info(f"Loaded {len(fake_images)} FAKE images")
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        from PIL import Image
        
        image_path = self.images[idx]
        label = self.labels[idx]
        
        image = Image.open(image_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image, label


class DeepfakeDetector(nn.Module):
    """Deepfake detection model based on ResNet50"""
    
    def __init__(self, pretrained=True, num_classes=2):
        """
        Initialize the model.
        
        Args:
            pretrained: Use pretrained weights
            num_classes: Number of output classes (2 for binary classification)
        """
        super(DeepfakeDetector, self).__init__()
        
        # Load pretrained ResNet50
        self.backbone = models.resnet50(pretrained=pretrained)
        
        # Get number of input features for the final layer
        num_features = self.backbone.fc.in_features
        
        # Replace the final classification layer
        self.backbone.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)


class ModelTrainer:
    """Trainer class for deepfake detection model"""
    
    def __init__(self, model, device, learning_rate=0.001, weight_decay=1e-5):
        """
        Initialize trainer.
        
        Args:
            model: PyTorch model
            device: torch.device object
            learning_rate: Learning rate for optimizer
            weight_decay: Weight decay for regularization
        """
        self.model = model.to(device)
        self.device = device
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(
            model.parameters(), 
            lr=learning_rate, 
            weight_decay=weight_decay
        )
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer,
            mode='min',
            factor=0.5,
            patience=3,
            verbose=True
        )
        
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'train_acc': [],
            'val_acc': []
        }
    
    def train_epoch(self, train_loader):
        """Train for one epoch"""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        pbar = tqdm(train_loader, desc='Training')
        for images, labels in pbar:
            images, labels = images.to(self.device), labels.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            outputs = self.model(images)
            loss = self.criterion(outputs, labels)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            # Metrics
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)
            
            pbar.set_postfix({'loss': loss.item(), 'acc': correct/total})
        
        epoch_loss = total_loss / len(train_loader)
        epoch_acc = correct / total
        
        return epoch_loss, epoch_acc
    
    def validate(self, val_loader):
        """Validate the model"""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            pbar = tqdm(val_loader, desc='Validating')
            for images, labels in pbar:
                images, labels = images.to(self.device), labels.to(self.device)
                
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                
                total_loss += loss.item()
                _, predicted = outputs.max(1)
                correct += predicted.eq(labels).sum().item()
                total += labels.size(0)
                
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
                
                pbar.set_postfix({'loss': loss.item()})
        
        epoch_loss = total_loss / len(val_loader)
        epoch_acc = correct / total
        
        return epoch_loss, epoch_acc, all_preds, all_labels
    
    def fit(self, train_loader, val_loader, epochs=20):
        """Train the model for specified epochs"""
        best_val_loss = float('inf')
        best_epoch = 0
        patience = 5
        patience_counter = 0
        
        logger.info(f"Starting training for {epochs} epochs...")
        
        for epoch in range(epochs):
            logger.info(f"\nEpoch {epoch+1}/{epochs}")
            
            # Train
            train_loss, train_acc = self.train_epoch(train_loader)
            
            # Validate
            val_loss, val_acc, _, _ = self.validate(val_loader)
            
            # Update history
            self.history['train_loss'].append(train_loss)
            self.history['val_loss'].append(val_loss)
            self.history['train_acc'].append(train_acc)
            self.history['val_acc'].append(val_acc)
            
            logger.info(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
            logger.info(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
            
            # Learning rate scheduler
            self.scheduler.step(val_loss)
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_epoch = epoch
                patience_counter = 0
                # Save best model
                self.save_model('best_model.pt')
                logger.info("Model improved! Saved.")
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    logger.info(f"Early stopping after {epoch+1} epochs")
                    break
        
        logger.info(f"\nTraining completed! Best model at epoch {best_epoch+1}")
    
    def save_model(self, filepath):
        """Save model checkpoint"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'history': self.history
        }, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load model checkpoint"""
        checkpoint = torch.load(filepath, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.history = checkpoint['history']
        logger.info(f"Model loaded from {filepath}")
    
    def plot_history(self, save_path='training_history.png'):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Loss plot
        ax1.plot(self.history['train_loss'], label='Train Loss')
        ax1.plot(self.history['val_loss'], label='Val Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.legend()
        ax1.grid(True)
        
        # Accuracy plot
        ax2.plot(self.history['train_acc'], label='Train Accuracy')
        ax2.plot(self.history['val_acc'], label='Val Accuracy')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy')
        ax2.set_title('Training and Validation Accuracy')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path)
        logger.info(f"Training history saved to {save_path}")
        plt.close()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train deepfake detection model')
    parser.add_argument('--data-path', default=r'a:\deepshit\frames_dataset',
                        help='Path to preprocessed frames dataset')
    parser.add_argument('--batch-size', type=int, default=32,
                        help='Batch size for training')
    parser.add_argument('--num-workers', type=int,
                        default=(0 if os.name == 'nt' else max(1, (os.cpu_count() or 2)//2)),
                        help='DataLoader workers (use 0 on Windows to avoid shared memory errors)')
    parser.add_argument('--epochs', type=int, default=20,
                        help='Number of training epochs')
    parser.add_argument('--learning-rate', type=float, default=0.001,
                        help='Learning rate')
    parser.add_argument('--val-split', type=float, default=0.2,
                        help='Validation split ratio')
    parser.add_argument('--limit-samples', type=int, default=None,
                        help='Limit samples per class (for debugging)')
    parser.add_argument('--resume', type=str, default=None,
                        help='Path to checkpoint (.pt) to resume training from')
    
    args = parser.parse_args()
    
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Data transforms
    train_transform = transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # Load dataset
    logger.info("Loading dataset...")
    dataset = FaceForensicsDataset(
        args.data_path, 
        transform=train_transform,
        limit_samples=args.limit_samples
    )
    
    # Split into train and validation
    val_size = int(len(dataset) * args.val_split)
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        dataset, [train_size, val_size]
    )
    
    # Change transform for validation
    val_dataset.dataset.transform = val_transform
    
    logger.info(f"Train set: {train_size}, Val set: {val_size}")
    
    # Data loaders
    workers = args.num_workers
    pin = (device.type == 'cuda')
    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=workers,
        pin_memory=pin,
        persistent_workers=(workers > 0)
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=workers,
        pin_memory=pin,
        persistent_workers=(workers > 0)
    )
    
    # Model
    logger.info("Creating model...")
    model = DeepfakeDetector(pretrained=True)
    
    # Trainer
    trainer = ModelTrainer(
        model, 
        device, 
        learning_rate=args.learning_rate
    )

    # Optional resume from checkpoint
    if args.resume:
        ckpt_path = Path(args.resume)
        if ckpt_path.exists():
            logger.info(f"Resuming training from checkpoint: {ckpt_path}")
            trainer.load_model(str(ckpt_path))
        else:
            logger.warning(f"Resume checkpoint not found at {ckpt_path}. Starting fresh.")
    
    # Train
    trainer.fit(train_loader, val_loader, epochs=args.epochs)
    
    # Save training history
    trainer.plot_history('training_history.png')
    
    # Final evaluation
    logger.info("\nFinal Evaluation on Validation Set:")
    with torch.no_grad():
        val_loss, val_acc, all_preds, all_labels = trainer.validate(val_loader)
        
        precision = precision_score(all_labels, all_preds)
        recall = recall_score(all_labels, all_preds)
        f1 = f1_score(all_labels, all_preds)
        
        logger.info(f"Validation Accuracy: {val_acc:.4f}")
        logger.info(f"Precision: {precision:.4f}")
        logger.info(f"Recall: {recall:.4f}")
        logger.info(f"F1-Score: {f1:.4f}")
        
        # Confusion matrix
        cm = confusion_matrix(all_labels, all_preds)
        logger.info("\nConfusion Matrix:")
        logger.info(f"[[{cm[0,0]} {cm[0,1]}]")
        logger.info(f" [{cm[1,0]} {cm[1,1]}]]")


if __name__ == '__main__':
    main()
