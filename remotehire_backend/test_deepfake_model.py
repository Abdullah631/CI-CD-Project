"""
Test deepfake model loading
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

# Now test the model
from loginapi.deepfake_detection import load_deepfake_model, MODEL_PATH, DEVICE

print(f"Model path: {MODEL_PATH}")
print(f"Model exists: {MODEL_PATH.exists()}")
print(f"Device: {DEVICE}")

print("\nAttempting to load model...")
model = load_deepfake_model()

if model is not None:
    print("✓ Model loaded successfully!")
    print(f"Model type: {type(model)}")
    print(f"Model device: {next(model.parameters()).device}")
else:
    print("✗ Failed to load model")
