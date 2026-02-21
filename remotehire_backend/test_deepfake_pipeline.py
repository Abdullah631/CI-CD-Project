"""
Test complete deepfake detection pipeline
"""
import os
import sys
import django
import base64
from PIL import Image
import io

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from loginapi.deepfake_detection import load_deepfake_model, TRANSFORM, DEVICE
import torch

print("Loading model...")
model = load_deepfake_model()
if model is None:
    print("✗ Failed to load model")
    sys.exit(1)

print("✓ Model loaded\n")

# Create a test image
print("Creating test image...")
test_image = Image.new('RGB', (640, 480), color='red')

# Convert to base64 (simulating frontend)
buffered = io.BytesIO()
test_image.save(buffered, format="JPEG", quality=95)
img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
print(f"Image size: {len(img_base64)} characters\n")

# Test preprocessing
print("Testing preprocessing...")
try:
    input_tensor = TRANSFORM(test_image).unsqueeze(0).to(DEVICE)
    print(f"✓ Tensor shape: {input_tensor.shape}")
    print(f"✓ Tensor device: {input_tensor.device}\n")
except Exception as e:
    print(f"✗ Preprocessing failed: {e}")
    sys.exit(1)

# Test inference
print("Testing inference...")
try:
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.softmax(output, dim=1)
        prediction = output.argmax(dim=1).item()
    
    class_names = ['REAL', 'FAKE']
    print(f"✓ Prediction: {class_names[prediction]}")
    print(f"✓ Confidence: {probabilities[0, prediction].item():.2%}")
    print(f"✓ Probabilities: REAL={probabilities[0, 0].item():.2%}, FAKE={probabilities[0, 1].item():.2%}")
    print("\n✓ Complete pipeline test PASSED!")
    
except Exception as e:
    print(f"✗ Inference failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
