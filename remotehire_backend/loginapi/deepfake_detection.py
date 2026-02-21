"""
Deepfake detection endpoint for interview video analysis
Uses the trained best_model.pt from deepfakemodel folder
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import base64
import io
import logging
import os
from pathlib import Path
import traceback
import jwt
from .models import User

logger = logging.getLogger(__name__)


# Load model once at module level
MODEL_PATH = Path(settings.BASE_DIR).parent / 'deepfakemodel' / 'best_model.pt'
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL = None
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def load_deepfake_model():
    """Load the deepfake detection model"""
    global MODEL
    
    if MODEL is not None:
        return MODEL
    
    try:
        # Import model architecture directly
        import sys
        import torch.nn as nn
        import torchvision.models as models
        
        # Define model architecture inline
        class DeepfakeDetector(nn.Module):
            """Deepfake detection model based on ResNet50"""
            
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
        
        if not MODEL_PATH.exists():
            logger.error(f"Model file not found at {MODEL_PATH}")
            return None
        
        model = DeepfakeDetector(pretrained=False)
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(DEVICE)
        model.eval()
        
        MODEL = model
        logger.info(f"Deepfake model loaded successfully from {MODEL_PATH}")
        return MODEL
        
    except Exception as e:
        logger.error(f"Error loading deepfake model: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None


@api_view(['POST'])
@csrf_exempt
def detect_deepfake(request):
    """
    Detect deepfake from base64 encoded image
    
    Expects JSON: {
        "image": "data:image/jpeg;base64,..."
    }
    
    Returns: {
        "prediction": "REAL" or "FAKE",
        "confidence": 0.95,
        "probabilities": {
            "REAL": 0.95,
            "FAKE": 0.05
        }
    }
    """
    # Manual JWT authentication (matching your codebase pattern)
    user = getattr(request, 'user', None)
    if not user or not hasattr(user, 'id'):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    user_id = payload.get('user_id')
                    if user_id:
                        try:
                            user = User.objects.get(id=user_id)
                            request.user = user
                        except User.DoesNotExist:
                            user = None
                except jwt.ExpiredSignatureError:
                    return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
                except jwt.InvalidTokenError:
                    return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user or not hasattr(user, 'id'):
        return Response(
            {'error': 'Authentication credentials were not provided.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        # Get base64 image from request
        image_data = request.data.get('image')
        if not image_data:
            return Response(
                {'error': 'No image data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Load model
        model = load_deepfake_model()
        if model is None:
            return Response(
                {'error': 'Deepfake model not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Parse base64 image
        try:
            # Remove data URL prefix if present
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            return Response(
                {'error': 'Invalid image data'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Preprocess image
        input_tensor = TRANSFORM(image).unsqueeze(0).to(DEVICE)
        
        # Run inference
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            prediction = output.argmax(dim=1).item()
        
        class_names = ['REAL', 'FAKE']
        result = {
            'prediction': class_names[prediction],
            'confidence': float(probabilities[0, prediction].item()),
            'probabilities': {
                'REAL': float(probabilities[0, 0].item()),
                'FAKE': float(probabilities[0, 1].item())
            },
            'device': str(DEVICE),
            'model_loaded': True
        }
        
        logger.info(f"Deepfake detection result: {result['prediction']} ({result['confidence']:.2%})")
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in deepfake detection: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {'error': 'Internal server error', 'details': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@csrf_exempt
def deepfake_model_status(request):
    """Check if deepfake model is loaded and ready"""
    try:
        model = load_deepfake_model()
        
        return Response({
            'model_loaded': model is not None,
            'model_path': str(MODEL_PATH),
            'model_exists': MODEL_PATH.exists(),
            'device': str(DEVICE),
            'cuda_available': torch.cuda.is_available()
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'model_loaded': False
        })
