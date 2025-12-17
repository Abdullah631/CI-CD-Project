"""
Inference script for deepfake detection model
Test the trained model on new images or videos
"""

import torch
import torchvision.transforms as transforms
from pathlib import Path
import logging
import cv2
import numpy as np
from PIL import Image
import argparse
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DeepfakeInference:
    """Inference class for deepfake detection"""
    
    def __init__(self, model_path, device='cuda'):
        """
        Initialize inference.
        
        Args:
            model_path: Path to saved model
            device: Device to use ('cuda' or 'cpu')
        """
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.model = self._load_model(model_path)
        self.model.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        self.class_names = ['REAL', 'FAKE']
    
    def _load_model(self, model_path):
        """Load trained model"""
        # Import model class
        import sys
        sys.path.insert(0, str(Path(model_path).parent))
        
        from train_model import DeepfakeDetector
        
        model = DeepfakeDetector(pretrained=False)
        checkpoint = torch.load(model_path, map_location=self.device)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(self.device)
        
        logger.info(f"Model loaded from {model_path}")
        return model
    
    def predict_image(self, image_path, return_confidence=True):
        """
        Predict on a single image.
        
        Args:
            image_path: Path to image file
            return_confidence: Return confidence scores
            
        Returns:
            Prediction result (dict)
        """
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Inference
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.softmax(output, dim=1)
                prediction = output.argmax(dim=1).item()
            
            result = {
                'image': str(image_path),
                'prediction': self.class_names[prediction],
                'confidence': float(probabilities[0, prediction].item()),
                'probabilities': {
                    self.class_names[0]: float(probabilities[0, 0].item()),
                    self.class_names[1]: float(probabilities[0, 1].item())
                }
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            return None
    
    def predict_video(self, video_path, frames_to_check=10):
        """
        Predict on a video file.
        
        Args:
            video_path: Path to video file
            frames_to_check: Number of frames to check
            
        Returns:
            Aggregated prediction result (dict)
        """
        try:
            cap = cv2.VideoCapture(str(video_path))
            
            if not cap.isOpened():
                logger.error(f"Cannot open video: {video_path}")
                return None
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            frame_indices = np.linspace(0, total_frames - 1, frames_to_check, dtype=int)
            
            predictions = []
            confidences = {'REAL': [], 'FAKE': []}
            
            for frame_idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(frame_rgb)
                
                # Inference
                input_tensor = self.transform(image).unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    output = self.model(input_tensor)
                    probabilities = torch.softmax(output, dim=1)
                    prediction = output.argmax(dim=1).item()
                
                predictions.append(self.class_names[prediction])
                confidences['REAL'].append(float(probabilities[0, 0].item()))
                confidences['FAKE'].append(float(probabilities[0, 1].item()))
            
            cap.release()
            
            # Aggregate results
            fake_count = predictions.count('FAKE')
            real_count = predictions.count('REAL')
            
            result = {
                'video': str(video_path),
                'total_frames_checked': len(predictions),
                'real_frames': real_count,
                'fake_frames': fake_count,
                'prediction': 'FAKE' if fake_count > real_count else 'REAL',
                'fake_probability': fake_count / len(predictions) if predictions else 0,
                'average_confidences': {
                    'REAL': np.mean(confidences['REAL']) if confidences['REAL'] else 0,
                    'FAKE': np.mean(confidences['FAKE']) if confidences['FAKE'] else 0
                }
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Error processing video {video_path}: {str(e)}")
            return None
    
    def predict_batch(self, data_path, file_type='image'):
        """
        Predict on batch of images or videos.
        
        Args:
            data_path: Directory containing images or videos
            file_type: 'image' or 'video'
            
        Returns:
            List of predictions
        """
        data_path = Path(data_path)
        results = []
        
        if file_type == 'image':
            extensions = ['*.jpg', '*.jpeg', '*.png']
            predict_func = self.predict_image
        else:  # video
            extensions = ['*.mp4', '*.avi', '*.mov']
            predict_func = self.predict_video
        
        # Find files
        files = []
        for ext in extensions:
            files.extend(data_path.glob(ext))
        
        if not files:
            logger.warning(f"No {file_type} files found in {data_path}")
            return results
        
        logger.info(f"Found {len(files)} {file_type} files")
        
        for file_path in files:
            logger.info(f"Processing: {file_path}")
            result = predict_func(file_path)
            if result:
                results.append(result)
        
        return results


def main():
    parser = argparse.ArgumentParser(description='Inference on deepfake detection model')
    parser.add_argument('--model-path', required=True,
                        help='Path to trained model checkpoint')
    parser.add_argument('--input', required=True,
                        help='Path to image, video, or directory')
    parser.add_argument('--type', choices=['image', 'video', 'batch'],
                        default='image',
                        help='Input type')
    parser.add_argument('--output', default='predictions.json',
                        help='Save predictions to JSON file')
    parser.add_argument('--device', choices=['cuda', 'cpu'],
                        default='cuda',
                        help='Device to use')
    
    args = parser.parse_args()
    
    # Initialize inference
    inference = DeepfakeInference(args.model_path, device=args.device)
    
    # Run prediction
    if args.type == 'image':
        result = inference.predict_image(args.input)
        results = [result] if result else []
    
    elif args.type == 'video':
        result = inference.predict_video(args.input)
        results = [result] if result else []
    
    else:  # batch
        file_type = 'image'
        results = inference.predict_batch(args.input, file_type=file_type)
    
    # Display results
    if results:
        logger.info("\n" + "="*60)
        for result in results:
            logger.info(json.dumps(result, indent=2))
        logger.info("="*60)
        
        # Save results
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        logger.info(f"Results saved to {args.output}")


if __name__ == '__main__':
    main()
