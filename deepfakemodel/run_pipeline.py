"""
Automated Pipeline Script
Orchestrates the entire workflow: preprocess -> analyze -> train -> test
"""

import os
import sys
import argparse
import subprocess
import logging
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """Orchestrate the entire deepfake detection pipeline"""
    
    def __init__(self, config):
        """Initialize with configuration"""
        self.config = config
        self.results = {}
        self.start_time = datetime.now()
    
    def run_command(self, cmd, description):
        """Run a Python script and capture output"""
        logger.info(f"\n{'='*60}")
        logger.info(f"STEP: {description}")
        logger.info(f"{'='*60}")
        logger.info(f"Command: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Log output
            if result.stdout:
                logger.info(result.stdout)
            
            self.results[description] = 'SUCCESS'
            logger.info(f"✓ {description} completed successfully")
            return True
        
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ {description} failed!")
            logger.error(f"Error: {e.stderr}")
            self.results[description] = 'FAILED'
            return False
        
        except Exception as e:
            logger.error(f"✗ Unexpected error in {description}: {str(e)}")
            self.results[description] = 'ERROR'
            return False
    
    def preprocess_videos(self):
        """Step 1: Preprocess videos"""
        cmd = [
            'python', 'preprocess_videos.py',
            '--dataset-path', self.config['dataset_path'],
            '--output-path', self.config['frames_path'],
            '--frames-per-video', str(self.config['frames_per_video']),
            '--frame-size', str(self.config['frame_size'][0]), 
                           str(self.config['frame_size'][1]),
            '--detector', self.config.get('detector', 'mtcnn'),
            '--face-margin', str(self.config['face_margin']),
            '--min-face-size', str(self.config['min_face_size'])
        ]

        if not self.config.get('detect_faces', True):
            cmd.append('--no-face-detect')
        if self.config.get('device'):
            cmd.extend(['--device', self.config['device']])
        
        return self.run_command(cmd, "Video Preprocessing")
    
    def analyze_dataset(self):
        """Step 2: Analyze preprocessed dataset"""
        cmd = [
            'python', 'analyze_dataset.py',
            '--data-path', self.config['frames_path'],
            '--plot',
            '--report'
        ]
        
        return self.run_command(cmd, "Dataset Analysis")
    
    def train_model(self):
        """Step 3: Train the model"""
        cmd = [
            'python', 'train_model.py',
            '--data-path', self.config['frames_path'],
            '--batch-size', str(self.config['batch_size']),
            '--epochs', str(self.config['epochs']),
            '--learning-rate', str(self.config['learning_rate']),
            '--val-split', str(self.config['val_split'])
        ]
        
        if self.config.get('limit_samples'):
            cmd.extend(['--limit-samples', str(self.config['limit_samples'])])
        
        return self.run_command(cmd, "Model Training")
    
    def run_inference_test(self):
        """Step 4: Test inference"""
        test_image = self.config.get('test_image')
        test_video = self.config.get('test_video')
        
        success = True
        
        if test_image:
            cmd = [
                'python', 'inference.py',
                '--model-path', 'best_model.pt',
                '--input', test_image,
                '--type', 'image',
                '--output', 'test_inference.json'
            ]
            success = self.run_command(cmd, "Inference Test (Image)") and success
        
        if test_video:
            cmd = [
                'python', 'inference.py',
                '--model-path', 'best_model.pt',
                '--input', test_video,
                '--type', 'video',
                '--output', 'test_inference_video.json'
            ]
            success = self.run_command(cmd, "Inference Test (Video)") and success
        
        return success
    
    def run_full_pipeline(self):
        """Run the complete pipeline"""
        logger.info("\n" + "="*60)
        logger.info("DEEPFAKE DETECTION FULL PIPELINE")
        logger.info("="*60)
        logger.info(f"Start time: {self.start_time}")
        logger.info(f"Configuration: {self.config}")
        
        # Create output directory
        Path(self.config['frames_path']).mkdir(parents=True, exist_ok=True)
        
        # Step 1: Preprocess
        if not self.preprocess_videos():
            logger.error("Pipeline stopped: Preprocessing failed")
            return False
        
        # Step 2: Analyze
        if not self.analyze_dataset():
            logger.warning("Dataset analysis failed, continuing anyway")
        
        # Step 3: Train
        if not self.train_model():
            logger.error("Pipeline stopped: Training failed")
            return False
        
        # Step 4: Test
        if self.config.get('test_image') or self.config.get('test_video'):
            if not self.run_inference_test():
                logger.warning("Inference test failed, but training completed")
        
        # Summary
        self.print_summary()
        return True
    
    def run_quick_pipeline(self):
        """Run quick pipeline with limited data"""
        logger.info("\n" + "="*60)
        logger.info("DEEPFAKE DETECTION QUICK PIPELINE (TESTING)")
        logger.info("="*60)
        logger.info(f"Start time: {self.start_time}")
        
        # Create output directory
        Path(self.config['frames_path']).mkdir(parents=True, exist_ok=True)
        
        # Step 1: Preprocess with few frames
        if not self.preprocess_videos():
            logger.error("Pipeline stopped: Preprocessing failed")
            return False
        
        # Step 2: Analyze
        if not self.analyze_dataset():
            logger.warning("Dataset analysis failed, continuing anyway")
        
        # Step 3: Train with few samples
        if not self.train_model():
            logger.error("Pipeline stopped: Training failed")
            return False
        
        # Summary
        self.print_summary()
        return True
    
    def print_summary(self):
        """Print pipeline execution summary"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        logger.info("\n" + "="*60)
        logger.info("PIPELINE EXECUTION SUMMARY")
        logger.info("="*60)
        
        for step, status in self.results.items():
            symbol = "✓" if status == "SUCCESS" else "✗"
            logger.info(f"{symbol} {step}: {status}")
        
        logger.info(f"\nTotal execution time: {duration}")
        logger.info(f"End time: {end_time}")
        logger.info("="*60 + "\n")
        
        # Save summary to file
        summary_file = 'pipeline_summary.txt'
        with open(summary_file, 'w') as f:
            f.write("PIPELINE EXECUTION SUMMARY\n")
            f.write("="*60 + "\n")
            f.write(f"Start time: {self.start_time}\n")
            f.write(f"End time: {end_time}\n")
            f.write(f"Duration: {duration}\n\n")
            f.write("Steps:\n")
            for step, status in self.results.items():
                symbol = "✓" if status == "SUCCESS" else "✗"
                f.write(f"  {symbol} {step}: {status}\n")
        
        logger.info(f"Summary saved to {summary_file}")


def main():
    parser = argparse.ArgumentParser(
        description='Automated deepfake detection pipeline'
    )
    
    # Dataset paths
    parser.add_argument('--dataset-path',
                        default=r'a:\deepshit\FaceForensics++_C23',
                        help='Path to FaceForensics++ dataset')
    parser.add_argument('--output-path',
                        default=r'a:\deepshit\frames_dataset',
                        help='Output path for preprocessed frames')
    
    # Preprocessing parameters
    parser.add_argument('--frames-per-video', type=int, default=10,
                        help='Frames to extract per video')
    parser.add_argument('--frame-size', type=int, nargs=2, default=[224, 224],
                        help='Frame size (width height)')
    parser.add_argument('--no-face-detect', dest='detect_faces', action='store_false',
                        help='Disable face detection during preprocessing')
    parser.add_argument('--detector', choices=['mtcnn', 'haar'], default='mtcnn',
                        help='Face detector to use (mtcnn uses GPU if available)')
    parser.add_argument('--device', default=None,
                        help='Torch device string (e.g., cuda, cuda:0, cpu); auto if omitted')
    parser.add_argument('--face-margin', type=float, default=0.2,
                        help='Margin (relative) to include around detected faces')
    parser.add_argument('--min-face-size', type=int, default=80,
                        help='Minimum face size (pixels) to keep')
    parser.set_defaults(detect_faces=True)
    
    # Training parameters
    parser.add_argument('--batch-size', type=int, default=32,
                        help='Batch size for training')
    parser.add_argument('--epochs', type=int, default=20,
                        help='Number of training epochs')
    parser.add_argument('--learning-rate', type=float, default=0.001,
                        help='Learning rate')
    parser.add_argument('--val-split', type=float, default=0.2,
                        help='Validation split ratio')
    
    # Pipeline mode
    parser.add_argument('--quick', action='store_true',
                        help='Run quick pipeline with limited data (for testing)')
    parser.add_argument('--limit-samples', type=int, default=None,
                        help='Limit samples per class (for debugging)')
    
    # Testing
    parser.add_argument('--test-image', default=None,
                        help='Path to test image for inference')
    parser.add_argument('--test-video', default=None,
                        help='Path to test video for inference')
    
    # Pipeline steps to run
    parser.add_argument('--preprocess-only', action='store_true',
                        help='Run only preprocessing')
    parser.add_argument('--analyze-only', action='store_true',
                        help='Run only dataset analysis')
    parser.add_argument('--train-only', action='store_true',
                        help='Run only training (requires preprocessed data)')
    parser.add_argument('--infer-only', action='store_true',
                        help='Run only inference (requires trained model)')
    
    args = parser.parse_args()
    
    # Build configuration
    config = {
        'dataset_path': args.dataset_path,
        'frames_path': args.output_path,
        'frames_per_video': args.frames_per_video,
        'frame_size': tuple(args.frame_size),
        'detect_faces': args.detect_faces,
        'detector': args.detector,
        'device': args.device,
        'face_margin': args.face_margin,
        'min_face_size': args.min_face_size,
        'batch_size': args.batch_size,
        'epochs': args.epochs,
        'learning_rate': args.learning_rate,
        'val_split': args.val_split,
        'limit_samples': args.limit_samples,
        'test_image': args.test_image,
        'test_video': args.test_video
    }
    
    # Create orchestrator
    orchestrator = PipelineOrchestrator(config)
    
    # Run appropriate pipeline
    if args.preprocess_only:
        orchestrator.preprocess_videos()
    elif args.analyze_only:
        orchestrator.analyze_dataset()
    elif args.train_only:
        orchestrator.train_model()
    elif args.infer_only:
        orchestrator.run_inference_test()
    elif args.quick:
        orchestrator.run_quick_pipeline()
    else:
        orchestrator.run_full_pipeline()


if __name__ == '__main__':
    main()
