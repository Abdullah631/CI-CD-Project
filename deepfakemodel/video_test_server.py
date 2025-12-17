from flask import Flask, request, jsonify, render_template_string
from pathlib import Path
import tempfile
import os
from inference import DeepfakeInference
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

UPLOAD_HTML = '''
<!doctype html>
<title>Upload video for deepfake test</title>
<h1>Upload video</h1>
<form method=post enctype=multipart/form-data>
  <input type=file name=video accept="video/*">
  <input type=submit value=Upload>
</form>
'''

@app.route('/', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        return render_template_string(UPLOAD_HTML)

    if 'video' not in request.files:
        return 'No video file uploaded', 400

    file = request.files['video']
    if file.filename == '':
        return 'No selected file', 400

    uploads_dir = Path('uploads')
    uploads_dir.mkdir(exist_ok=True)
    # Save uploaded file
    tmp_path = uploads_dir / file.filename
    file.save(str(tmp_path))
    logger.info(f'Saved uploaded file to {tmp_path}')

    # Run inference
    model_path = request.args.get('model', 'best_model.pt')
    device = request.args.get('device', 'cuda')

    inference = DeepfakeInference(model_path, device=device)
    result = inference.predict_video(str(tmp_path), frames_to_check=10)

    return jsonify(result)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Run video upload server for deepfake testing')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--model', default='best_model.pt')
    parser.add_argument('--device', choices=['cuda','cpu'], default='cuda')
    args = parser.parse_args()

    # Warm load model (optional)
    app.config['MODEL_PATH'] = args.model
    app.config['DEVICE'] = args.device
    logger.info(f'Starting server with model={args.model} device={args.device}')
    app.run(host=args.host, port=args.port)
