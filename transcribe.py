import os
import sys
import json
import ffmpeg
import whisper
import torch

# Config
MODEL_NAME    = "small"                      # tiny, small, medium, large
INPUT_AUDIO   = "sample.wav"
CONVERTED_WAV = "sample_fixed.wav"
JSON_OUTPUT   = "transcription.json"

def eprint(*args, **kwargs):
    """Print to stderr."""
    print(*args, file=sys.stderr, **kwargs)

def convert_audio(input_path, output_path):
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, ac=1, ar=16000, format="wav", acodec="pcm_s16le")
            .run(overwrite_output=True, capture_stdout=True, capture_stderr=True)
        )
    except ffmpeg.Error as e:
        eprint("❌ FFmpeg conversion failed:", e)
        sys.exit(1)

def load_model(name):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        model = whisper.load_model(name, device=device)
    except Exception as e:
        eprint("❌ Failed to load Whisper model:", e)
        sys.exit(1)
    return model

def transcribe(model, wav_path):
    try:
        result = model.transcribe(wav_path, fp16=False, language="en")
        return result.get("text", "")
    except Exception as e:
        eprint("❌ Transcription failed:", e)
        sys.exit(1)

def main():
    # 1. Check input file
    if not os.path.exists(INPUT_AUDIO):
        eprint(f"❌ Input audio not found: {INPUT_AUDIO}")
        sys.exit(1)

    # 2. Convert
    convert_audio(INPUT_AUDIO, CONVERTED_WAV)

    # 3. Load model
    model = load_model(MODEL_NAME)

    # 4. Transcribe
    text = transcribe(model, CONVERTED_WAV)

    # 5. Save JSON file (optional)
    try:
        with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
            json.dump({"transcription": text}, f, ensure_ascii=False, indent=4)
    except Exception as e:
        eprint("⚠️ Could not write JSON file:", e)

    # 6. **Print only the JSON to stdout** for your Node.js caller
    print(json.dumps({"transcription": text}, ensure_ascii=False))

if __name__ == "__main__":
    main()
