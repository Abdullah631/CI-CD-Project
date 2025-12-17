"""
Video Preprocessing Script for FaceForensics++ Dataset
Extracts frames from videos and organizes them by class (REAL/FAKE)
"""

import os
import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm
import argparse
import logging

try:
    import torch
    from facenet_pytorch import MTCNN
except ImportError:  # Optional GPU face detector
    torch = None
    MTCNN = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VideoPreprocessor:
    def __init__(self, dataset_path, output_path, frames_per_video=10, target_size=(224, 224), detect_faces=True, face_margin=0.2, min_face_size=80, detector='mtcnn', device=None):
        """
        Initialize the video preprocessor.
        
        Args:
            dataset_path: Path to FaceForensics++_C23 dataset
            output_path: Path to save extracted frames
            frames_per_video: Number of frames to extract per video
            target_size: Target frame size (height, width)
            detect_faces: Whether to detect and crop faces
            face_margin: Extra margin to include around detected face (relative to bbox)
            min_face_size: Minimum face size (pixels) to be considered valid
            detector: 'mtcnn' (GPU-capable) or 'haar'
            device: torch device string or None to auto-select
        """
        self.dataset_path = Path(dataset_path)
        self.output_path = Path(output_path)
        self.frames_per_video = frames_per_video
        self.target_size = target_size
        self.detect_faces = detect_faces
        self.face_margin = face_margin
        self.min_face_size = min_face_size
        self.detector = detector
        self.device = device or ('cuda' if torch and torch.cuda.is_available() else 'cpu')
        self.frame_count = 0
        self.face_cascade = None
        self.mtcnn = None
        
        # Create output directories
        self.output_path.mkdir(parents=True, exist_ok=True)
        (self.output_path / 'REAL').mkdir(parents=True, exist_ok=True)
        (self.output_path / 'FAKE').mkdir(parents=True, exist_ok=True)

        if self.detect_faces and self.detector == 'mtcnn':
            if MTCNN is None or torch is None:
                logger.warning("facenet-pytorch not installed; falling back to Haar cascade.")
                self.detector = 'haar'
            else:
                self.mtcnn = MTCNN(keep_all=True, device=self.device, thresholds=[0.6, 0.7, 0.7])

        if self.detect_faces and self.detector == 'haar':
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            if self.face_cascade.empty():
                logger.warning("Failed to load Haar cascade. Continuing without face detection.")
                self.detect_faces = False

    def _crop_face(self, frame):
        """Detect face and return cropped region; None if detection fails."""
        if not self.detect_faces:
            return None

        if self.detector == 'haar' and self.face_cascade is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(self.min_face_size, self.min_face_size)
            )

            if len(faces) == 0:
                return None

            # Pick the largest detected face
            x, y, w, h = max(faces, key=lambda b: b[2] * b[3])

        elif self.detector == 'mtcnn' and self.mtcnn is not None:
            # MTCNN expects RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            boxes, probs = self.mtcnn.detect(rgb)
            if boxes is None or len(boxes) == 0:
                return None
            if probs is not None:
                idx = int(np.argmax(probs))
            else:
                idx = 0
            x1f, y1f, x2f, y2f = boxes[idx]
            w = int(x2f - x1f)
            h = int(y2f - y1f)
            if w < self.min_face_size or h < self.min_face_size:
                return None
            x = int(x1f)
            y = int(y1f)
        else:
            return None

        # Expand bounding box with margin
        margin_w = int(w * self.face_margin)
        margin_h = int(h * self.face_margin)
        x1 = max(x - margin_w, 0)
        y1 = max(y - margin_h, 0)
        x2 = min(x + w + margin_w, frame.shape[1])
        y2 = min(y + h + margin_h, frame.shape[0])

        return frame[y1:y2, x1:x2]
        
    def extract_frames(self, video_path, label, max_frames=None):
        """
        Extract frames from a video file.
        
        Args:
            video_path: Path to video file
            label: 'REAL' or 'FAKE'
            max_frames: Maximum number of frames to extract
            
        Returns:
            Number of frames extracted
        """
        try:
            cap = cv2.VideoCapture(str(video_path))
            
            if not cap.isOpened():
                logger.warning(f"Failed to open video: {video_path}")
                return 0
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                logger.warning(f"No frames in video: {video_path}")
                cap.release()
                return 0
            
            # Calculate frame interval to extract evenly distributed frames
            frame_indices = np.linspace(
                0, 
                total_frames - 1, 
                max_frames if max_frames else self.frames_per_video,
                dtype=int
            )
            
            extracted_count = 0
            video_name = Path(video_path).stem
            
            for frame_idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                cropped = self._crop_face(frame)
                if cropped is None:
                    # Skip frames without a detected face to keep dataset face-only
                    continue

                resized_frame = cv2.resize(cropped, self.target_size)
                
                # Save frame
                output_file = (
                    self.output_path / label / 
                    f"{video_name}_frame_{extracted_count:03d}.jpg"
                )
                
                cv2.imwrite(str(output_file), resized_frame)
                extracted_count += 1
            
            cap.release()
            return extracted_count
            
        except Exception as e:
            logger.error(f"Error processing video {video_path}: {str(e)}")
            return 0
    
    def process_fake_sequences(self):
        """Process all manipulated (fake) sequences."""
        logger.info("Processing FAKE sequences...")
        
        fake_types = ['Deepfakes', 'Face2Face', 'FaceSwap', 'NeuralTextures']
        total_extracted = 0
        
        for fake_type in fake_types:
            video_dir = (
                self.dataset_path / 'manipulated_sequences' / fake_type / 'c23' / 'videos'
            )
            
            if not video_dir.exists():
                logger.warning(f"Directory not found: {video_dir}")
                continue
            
            logger.info(f"Processing {fake_type}...")
            video_files = list(video_dir.glob('*.mp4'))
            
            for video_path in tqdm(video_files, desc=f"{fake_type}"):
                count = self.extract_frames(video_path, 'FAKE')
                total_extracted += count
        
        return total_extracted
    
    def process_real_sequences(self):
        """Process all original (real) sequences."""
        logger.info("Processing REAL sequences...")
        
        video_dir = (
            self.dataset_path / 'original_sequences' / 'youtube' / 'c23' / 'videos'
        )
        
        if not video_dir.exists():
            logger.error(f"Directory not found: {video_dir}")
            return 0
        
        total_extracted = 0
        video_files = list(video_dir.glob('*.mp4'))
        
        for video_path in tqdm(video_files, desc="Original sequences"):
            count = self.extract_frames(video_path, 'REAL')
            total_extracted += count
        
        return total_extracted
    
    def preprocess_all(self):
        """Preprocess all videos in the dataset."""
        logger.info("Starting preprocessing of FaceForensics++ dataset...")
        logger.info(f"Output path: {self.output_path}")
        logger.info(f"Frames per video: {self.frames_per_video}")
        logger.info(f"Target frame size: {self.target_size}")
        logger.info(f"Face detection: {'enabled' if self.detect_faces else 'disabled'}")
        if self.detect_faces:
            logger.info(f"Detector: {self.detector}")
            logger.info(f"Device: {self.device}")
            logger.info(f"Face margin: {self.face_margin}")
            logger.info(f"Min face size: {self.min_face_size}")
        
        fake_count = self.process_fake_sequences()
        real_count = self.process_real_sequences()
        
        total_count = fake_count + real_count
        
        logger.info("\n" + "="*50)
        logger.info("Preprocessing completed!")
        logger.info(f"Total frames extracted: {total_count}")
        logger.info(f"FAKE frames: {fake_count}")
        logger.info(f"REAL frames: {real_count}")
        logger.info(f"Output saved to: {self.output_path}")
        logger.info("="*50)
        
        # Print dataset statistics
        self.print_statistics()
    
    def print_statistics(self):
        """Print dataset statistics."""
        real_frames = len(list((self.output_path / 'REAL').glob('*.jpg')))
        fake_frames = len(list((self.output_path / 'FAKE').glob('*.jpg')))
        
        logger.info("\nDataset Statistics:")
        logger.info(f"REAL class frames: {real_frames}")
        logger.info(f"FAKE class frames: {fake_frames}")
        logger.info(f"Total frames: {real_frames + fake_frames}")
        if real_frames + fake_frames > 0:
            logger.info(f"Class balance ratio (REAL/FAKE): {real_frames/fake_frames:.2f}")


def main():
    parser = argparse.ArgumentParser(
        description='Preprocess FaceForensics++ videos by extracting frames'
    )
    parser.add_argument(
        '--dataset-path',
        default=r'a:\deepshit\FaceForensics++_C23',
        help='Path to FaceForensics++_C23 dataset'
    )
    parser.add_argument(
        '--output-path',
        default=r'a:\deepshit\frames_dataset',
        help='Path to save extracted frames'
    )
    parser.add_argument(
        '--frames-per-video',
        type=int,
        default=10,
        help='Number of frames to extract per video'
    )
    parser.add_argument(
        '--frame-size',
        type=int,
        nargs=2,
        default=[224, 224],
        help='Target frame size (width height)'
    )
    parser.add_argument(
        '--no-face-detect',
        dest='detect_faces',
        action='store_false',
        help='Disable face detection and cropping'
    )
    parser.add_argument(
        '--detector',
        choices=['mtcnn', 'haar'],
        default='mtcnn',
        help='Face detector to use (mtcnn uses GPU if available)'
    )
    parser.add_argument(
        '--device',
        default=None,
        help='Torch device string (e.g., cuda, cuda:0, cpu); auto if omitted'
    )
    parser.add_argument(
        '--face-margin',
        type=float,
        default=0.2,
        help='Margin (relative) to include around detected face'
    )
    parser.add_argument(
        '--min-face-size',
        type=int,
        default=80,
        help='Minimum face size in pixels to keep'
    )

    parser.set_defaults(detect_faces=True)
    
    args = parser.parse_args()
    
    preprocessor = VideoPreprocessor(
        dataset_path=args.dataset_path,
        output_path=args.output_path,
        frames_per_video=args.frames_per_video,
        target_size=tuple(args.frame_size),
        detect_faces=args.detect_faces,
        face_margin=args.face_margin,
        min_face_size=args.min_face_size,
        detector=args.detector,
        device=args.device
    )
    
    preprocessor.preprocess_all()


if __name__ == '__main__':
    main()
