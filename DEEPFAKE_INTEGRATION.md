# Deepfake Detection Integration - Interview Room

## Overview
Successfully integrated the deepfake detection model (`best_model.pt`) into the Remote Hire interview room for real-time video analysis during interviews.

## Backend Implementation

### File: `loginapi/deepfake_detection.py`
Created new API endpoint for deepfake detection with the following features:

**Endpoints:**
1. **POST `/api/deepfake/detect/`**
   - Accepts base64-encoded image from video frame
   - Returns prediction (REAL/FAKE), confidence score, and detailed probabilities
   - Uses PyTorch model with ResNet50 architecture
   - Authenticated endpoint (requires JWT token)

2. **GET `/api/deepfake/status/`**
   - Returns model loading status
   - Shows device info (CUDA/CPU)
   - Model path and availability check

**Key Features:**
- Model loaded once at module level for performance
- Uses same preprocessing as training (224x224 resize, normalization)
- Supports both CUDA and CPU inference
- Comprehensive error handling and logging

**Model Path:**
```
deepfakemodel/best_model.pt
```

**API Response Format:**
```json
{
  "prediction": "REAL" | "FAKE",
  "confidence": 0.95,
  "probabilities": {
    "REAL": 0.95,
    "FAKE": 0.05
  },
  "device": "cuda:0",
  "model_loaded": true
}
```

### URL Configuration
Updated `loginapi/urls.py` to include:
```python
path('deepfake/detect/', detect_deepfake, name='detect_deepfake'),
path('deepfake/status/', deepfake_model_status, name='deepfake_model_status'),
```

## Frontend Implementation

### File: `remotehire-frontend/src/pages/InterviewRoomPage.jsx`

**New State Variables:**
```javascript
const [deepfakeResult, setDeepfakeResult] = useState(null);
const [isCheckingDeepfake, setIsCheckingDeepfake] = useState(false);
const [deepfakeHistory, setDeepfakeHistory] = useState([]);
```

**New Icons:**
- `Shield` - for deepfake detection button
- `AlertTriangle` - for error display

**New Function: `captureAndCheckDeepfake()`**
1. Captures current frame from remote video stream
2. Converts to canvas → base64 JPEG
3. Sends to backend API
4. Displays results with confidence scores
5. Maintains history of last 10 checks

**UI Components Added:**

1. **Shield Button** (in controls)
   - Located next to chat and call controls
   - Disabled when no remote stream or already checking
   - Triggers deepfake analysis on click

2. **Results Panel**
   - Large prediction display (REAL/FAKE)
   - Confidence percentage
   - Detailed probability bars for both classes
   - Timestamp
   - Model info (device, model file)
   - Color-coded: Green for REAL, Red for FAKE

3. **Loading State**
   - Animated spinner
   - "Analyzing video..." message
   - Shown while API request is in progress

4. **Error Handling**
   - Displays error messages
   - User-friendly error descriptions
   - Timestamp for each check

## Usage Flow

1. **Recruiter/Candidate joins interview room**
2. **Video streams are established**
3. **Click Shield button** to analyze remote participant's video
4. **System captures frame** from remote video
5. **Backend processes** through deepfake model
6. **Results displayed** with confidence scores
7. **Can check multiple times** during interview
8. **History maintained** (last 10 results)

## Technical Requirements

### Backend Dependencies:
```bash
pip install torch torchvision
```

### Model Requirements:
- Model file: `deepfakemodel/best_model.pt`
- Architecture: ResNet50-based
- Input: 224x224 RGB images
- Output: Binary classification (REAL/FAKE)

### Frontend:
- Axios for API calls
- Canvas API for frame capture
- Lucide React icons (Shield, AlertTriangle)

## Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **Image Size**: Base64 encoding keeps data manageable
3. **Rate Limiting**: Consider adding for production
4. **Model Access**: Only accessible through API, not exposed directly

## Performance Optimization

1. **Model Caching**: Loaded once at module level
2. **GPU Acceleration**: Automatically uses CUDA if available
3. **Frame Quality**: JPEG at 95% quality balances size/quality
4. **History Limit**: Keeps only last 10 results to save memory

## Future Enhancements

1. **Continuous Monitoring**: Auto-check every N seconds
2. **Alerts**: Notify if multiple FAKE detections
3. **Recording**: Save detection results with interview
4. **Threshold Settings**: Admin-configurable confidence thresholds
5. **Batch Analysis**: Analyze multiple frames and aggregate results
6. **Video Recording**: Store analyzed frames for review

## Testing

### Backend Test:
```bash
curl -X POST http://localhost:8000/api/deepfake/detect/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

### Frontend Test:
1. Start interview room
2. Ensure remote video is streaming
3. Click Shield button
4. Verify results appear below controls
5. Check multiple times to test history

## Files Modified

### Backend:
- ✅ Created: `remotehire_backend/loginapi/deepfake_detection.py`
- ✅ Modified: `remotehire_backend/loginapi/urls.py`
- ✅ Modified: `remotehire_backend/.env` (database port updated to 6543)

### Frontend:
- ✅ Modified: `remotehire-frontend/src/pages/InterviewRoomPage.jsx`

### Model:
- ✅ Used: `deepfakemodel/best_model.pt`
- ✅ Referenced: `deepfakemodel/train_model.py` (for model architecture)
- ✅ Referenced: `deepfakemodel/inference.py` (for preprocessing logic)

## Known Limitations

1. **Single Frame Analysis**: Checks one frame at a time
2. **Manual Trigger**: User must click button to check
3. **No Persistent Storage**: Results not saved to database
4. **Model Size**: Requires model file to be present
5. **GPU Requirement**: Performs best with CUDA-enabled GPU

## Deployment Notes

### Production Checklist:
- [ ] Ensure `best_model.pt` is deployed with backend
- [ ] Configure model path in settings
- [ ] Test with both CUDA and CPU
- [ ] Add rate limiting to prevent abuse
- [ ] Consider model optimization (quantization, pruning)
- [ ] Monitor inference latency
- [ ] Set up logging for detections
- [ ] Add admin dashboard for detection history

### Environment Variables:
```env
DEEPFAKE_MODEL_PATH=../deepfakemodel/best_model.pt
DEEPFAKE_DEVICE=cuda  # or cpu
DEEPFAKE_CONFIDENCE_THRESHOLD=0.7
```

## Support

For issues or questions:
- Check model file exists at `deepfakemodel/best_model.pt`
- Verify PyTorch installation: `python -c "import torch; print(torch.__version__)"`
- Check CUDA availability: `python -c "import torch; print(torch.cuda.is_available())"`
- Review backend logs for model loading errors
- Test endpoint status: `GET /api/deepfake/status/`

---

**Integration Complete ✅**

The deepfake detection system is now fully integrated into the interview room and ready for testing!
