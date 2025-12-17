"""
Dataset Analysis and Visualization Script
Analyze the preprocessed frames and generate statistics
"""

import os
from pathlib import Path
from collections import defaultdict
import logging
import argparse
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from PIL import Image
from tqdm import tqdm

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatasetAnalyzer:
    """Analyze preprocessed frames dataset"""
    
    def __init__(self, dataset_path):
        """Initialize analyzer"""
        self.dataset_path = Path(dataset_path)
        self.real_dir = self.dataset_path / 'REAL'
        self.fake_dir = self.dataset_path / 'FAKE'
    
    def count_images(self):
        """Count total images in each class"""
        real_count = len(list(self.real_dir.glob('*.jpg'))) + \
                     len(list(self.real_dir.glob('*.png')))
        fake_count = len(list(self.fake_dir.glob('*.jpg'))) + \
                     len(list(self.fake_dir.glob('*.png')))
        
        return real_count, fake_count
    
    def get_image_sizes(self, sample_size=100):
        """Get statistics about image sizes"""
        sizes = {'real': [], 'fake': []}
        
        # Sample real images
        real_images = list(self.real_dir.glob('*.jpg'))[:sample_size]
        for img_path in tqdm(real_images, desc='Analyzing REAL images'):
            try:
                img = Image.open(img_path)
                sizes['real'].append(img.size)
            except:
                pass
        
        # Sample fake images
        fake_images = list(self.fake_dir.glob('*.jpg'))[:sample_size]
        for img_path in tqdm(fake_images, desc='Analyzing FAKE images'):
            try:
                img = Image.open(img_path)
                sizes['fake'].append(img.size)
            except:
                pass
        
        return sizes
    
    def get_video_statistics(self):
        """Get statistics per video (frames count)"""
        video_stats = defaultdict(lambda: {'real': 0, 'fake': 0})
        
        # Count REAL frames per video
        for img_path in self.real_dir.glob('*.jpg'):
            video_id = img_path.stem.rsplit('_frame_', 1)[0]
            video_stats[video_id]['real'] += 1
        
        # Count FAKE frames per video
        for img_path in self.fake_dir.glob('*.jpg'):
            video_id = img_path.stem.rsplit('_frame_', 1)[0]
            video_stats[video_id]['fake'] += 1
        
        return video_stats
    
    def print_statistics(self):
        """Print comprehensive statistics"""
        logger.info("\n" + "="*60)
        logger.info("DATASET STATISTICS")
        logger.info("="*60)
        
        # Count images
        real_count, fake_count = self.count_images()
        total_count = real_count + fake_count
        
        logger.info(f"\nImage Counts:")
        logger.info(f"  REAL frames: {real_count:,}")
        logger.info(f"  FAKE frames: {fake_count:,}")
        logger.info(f"  Total frames: {total_count:,}")
        
        if total_count > 0:
            real_pct = (real_count / total_count) * 100
            fake_pct = (fake_count / total_count) * 100
            logger.info(f"\nClass Distribution:")
            logger.info(f"  REAL: {real_pct:.2f}%")
            logger.info(f"  FAKE: {fake_pct:.2f}%")
            logger.info(f"  Imbalance Ratio (FAKE/REAL): {fake_count/real_count:.2f}:1")
        
        # Video statistics
        logger.info(f"\nVideo Statistics:")
        video_stats = self.get_video_statistics()
        logger.info(f"  Unique videos with REAL frames: {sum(1 for v in video_stats.values() if v['real'] > 0)}")
        logger.info(f"  Unique videos with FAKE frames: {sum(1 for v in video_stats.values() if v['fake'] > 0)}")
        
        if video_stats:
            real_frames_per_video = [v['real'] for v in video_stats.values() if v['real'] > 0]
            fake_frames_per_video = [v['fake'] for v in video_stats.values() if v['fake'] > 0]
            
            if real_frames_per_video:
                logger.info(f"  Avg frames per REAL video: {np.mean(real_frames_per_video):.1f}")
                logger.info(f"  Min/Max frames per REAL video: {min(real_frames_per_video)}/{max(real_frames_per_video)}")
            
            if fake_frames_per_video:
                logger.info(f"  Avg frames per FAKE video: {np.mean(fake_frames_per_video):.1f}")
                logger.info(f"  Min/Max frames per FAKE video: {min(fake_frames_per_video)}/{max(fake_frames_per_video)}")
        
        # Image size statistics
        logger.info(f"\nImage Size Analysis (sampling 100 images):")
        sizes = self.get_image_sizes(sample_size=100)
        
        if sizes['real']:
            real_sizes = np.array(sizes['real'])
            logger.info(f"  REAL images:")
            logger.info(f"    Width: {real_sizes[:, 0].mean():.0f} ± {real_sizes[:, 0].std():.0f}")
            logger.info(f"    Height: {real_sizes[:, 1].mean():.0f} ± {real_sizes[:, 1].std():.0f}")
        
        if sizes['fake']:
            fake_sizes = np.array(sizes['fake'])
            logger.info(f"  FAKE images:")
            logger.info(f"    Width: {fake_sizes[:, 0].mean():.0f} ± {fake_sizes[:, 0].std():.0f}")
            logger.info(f"    Height: {fake_sizes[:, 1].mean():.0f} ± {fake_sizes[:, 1].std():.0f}")
        
        logger.info("="*60 + "\n")
    
    def plot_statistics(self, output_file='dataset_stats.png'):
        """Generate visualization plots"""
        real_count, fake_count = self.count_images()
        
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # 1. Class distribution pie chart
        ax = axes[0, 0]
        labels = ['REAL', 'FAKE']
        sizes = [real_count, fake_count]
        colors = ['#2ecc71', '#e74c3c']
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
        ax.set_title('Class Distribution')
        
        # 2. Class counts bar chart
        ax = axes[0, 1]
        ax.bar(labels, sizes, color=colors)
        ax.set_ylabel('Number of Frames')
        ax.set_title('Frame Count by Class')
        for i, v in enumerate(sizes):
            ax.text(i, v + 1000, str(v), ha='center', fontweight='bold')
        
        # 3. Videos count
        ax = axes[1, 0]
        video_stats = self.get_video_statistics()
        real_videos = sum(1 for v in video_stats.values() if v['real'] > 0)
        fake_videos = sum(1 for v in video_stats.values() if v['fake'] > 0)
        ax.bar(['REAL Videos', 'FAKE Videos'], [real_videos, fake_videos], color=colors)
        ax.set_ylabel('Number of Videos')
        ax.set_title('Videos with Extracted Frames')
        
        # 4. Frames per video
        ax = axes[1, 1]
        real_frames_per_video = [v['real'] for v in video_stats.values() if v['real'] > 0]
        fake_frames_per_video = [v['fake'] for v in video_stats.values() if v['fake'] > 0]
        
        ax.boxplot([real_frames_per_video, fake_frames_per_video],
                   labels=['REAL', 'FAKE'],
                   patch_artist=True,
                   boxprops=dict(facecolor='lightblue'))
        ax.set_ylabel('Number of Frames')
        ax.set_title('Distribution of Frames per Video')
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(output_file, dpi=150)
        logger.info(f"Statistics plot saved to {output_file}")
        plt.close()
    
    def generate_report(self, output_file='dataset_report.txt'):
        """Generate text report"""
        with open(output_file, 'w') as f:
            f.write("="*60 + "\n")
            f.write("DEEPFAKE DETECTION DATASET REPORT\n")
            f.write("="*60 + "\n\n")
            
            real_count, fake_count = self.count_images()
            total_count = real_count + fake_count
            
            f.write("IMAGE COUNTS:\n")
            f.write(f"  REAL frames: {real_count:,}\n")
            f.write(f"  FAKE frames: {fake_count:,}\n")
            f.write(f"  Total frames: {total_count:,}\n\n")
            
            if total_count > 0:
                real_pct = (real_count / total_count) * 100
                fake_pct = (fake_count / total_count) * 100
                f.write("CLASS DISTRIBUTION:\n")
                f.write(f"  REAL: {real_pct:.2f}%\n")
                f.write(f"  FAKE: {fake_pct:.2f}%\n")
                f.write(f"  Imbalance Ratio: {fake_count/real_count:.2f}:1\n\n")
            
            video_stats = self.get_video_statistics()
            f.write("VIDEO STATISTICS:\n")
            f.write(f"  Unique videos: {len(video_stats)}\n")
            f.write(f"  Videos with REAL frames: {sum(1 for v in video_stats.values() if v['real'] > 0)}\n")
            f.write(f"  Videos with FAKE frames: {sum(1 for v in video_stats.values() if v['fake'] > 0)}\n\n")
            
            f.write("RECOMMENDATIONS:\n")
            if fake_count > real_count * 3:
                f.write("  - Dataset is heavily imbalanced towards FAKE\n")
                f.write("  - Consider using weighted loss or resampling\n")
            f.write("  - Check generated training_history.png after training\n")
            f.write("  - Monitor both precision and recall during training\n")
            f.write("  - Use validation set to prevent overfitting\n")
        
        logger.info(f"Report saved to {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Analyze preprocessed frames dataset')
    parser.add_argument('--data-path', default=r'a:\deepshit\frames_dataset',
                        help='Path to preprocessed frames dataset')
    parser.add_argument('--plot', action='store_true',
                        help='Generate visualization plots')
    parser.add_argument('--report', action='store_true',
                        help='Generate text report')
    
    args = parser.parse_args()
    
    analyzer = DatasetAnalyzer(args.data_path)
    
    # Print statistics
    analyzer.print_statistics()
    
    # Generate plot
    if args.plot:
        analyzer.plot_statistics()
    
    # Generate report
    if args.report:
        analyzer.generate_report()
    
    if not args.plot and not args.report:
        logger.info("Run with --plot and/or --report flags to generate outputs")


if __name__ == '__main__':
    main()
