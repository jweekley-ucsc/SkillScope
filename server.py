import os
import uuid
import requests
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploaded_audio"
TRANSCRIPT_FOLDER = "transcripts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPT_FOLDER, exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"

@app.route("/interview")
def serve_interview():
    return render_template("interview.html")

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files["audio"]
    filename = f"{uuid.uuid4()}.webm"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    audio.save(filepath)

    # Send to OpenAI Whisper API
    with open(filepath, "rb") as f:
        response = requests.post(
            WHISPER_API_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={"file": (filename, f, "audio/webm")},
            data={"model": "whisper-1", "response_format": "verbose_json"}
        )

    if response.status_code != 200:
        return jsonify({"error": "Transcription failed", "details": response.text}), 500

    json_data = response.json()
    transcript_filename = filename.replace(".webm", ".json")
    transcript_path = os.path.join(TRANSCRIPT_FOLDER, transcript_filename)
    with open(transcript_path, "w") as out_file:
        out_file.write(response.text)

    return jsonify({
        "status": "success",
        "filename": filename,
        "transcript": json_data
    })

if __name__ == "__main__":
    app.run(port=5050, debug=True)
