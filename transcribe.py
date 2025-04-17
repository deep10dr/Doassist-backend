import os
import json
import wave
import sys
import ffmpeg
import whisper  # OpenAI Whisper
import torch

# Paths
MODEL_PATH = "small"  # Whisper model: "tiny", "small", "medium", "large"
INPUT_AUDIO = "D:/React/Mini-project/Backend/sample.wav"  # Input audio file
CONVERTED_AUDIO = "D:/React/Mini-project/Backend/sample_fixed.wav"  # Fixed WAV output
JSON_OUTPUT = "D:/React/Mini-project/Backend/transcription.json"  # Output JSON file

# Convert audio to 16-bit PCM WAV
def convert_audio(input_file, output_file):
    try:
        ffmpeg.input(input_file).output(
            output_file,
            ac=1,  # Mono audio
            ar=16000,  # 16kHz sample rate
            format="wav",
            acodec="pcm_s16le"
        ).run(overwrite_output=True)
        print(f"✅ Converted {input_file} to {output_file}")
    except ffmpeg.Error as e:
        print("❌ FFmpeg conversion failed:", e)
        sys.exit(1)

# Load OpenAI Whisper Model
def load_whisper_model():
    print("⏳ Loading Whisper model...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model(MODEL_PATH, device=device)
    print("✅ Whisper model loaded successfully.")
    return model

# Transcribe Audio
def transcribe_audio(model, wav_path):
    print(f"🎙️ Transcribing: {wav_path}")
    result = model.transcribe(wav_path, fp16=False, language="en")  # Disable FP16 for CPU
    return result["text"]

# Save Transcription to JSON
def save_transcription(text, json_path):
    with open(json_path, "w", encoding="utf-8") as json_file:
        json.dump({"transcription": text}, json_file, indent=4, ensure_ascii=False)
    print(f"📄 Transcription saved to {json_path}")

# Main Execution
if __name__ == "__main__":
    if not os.path.exists(INPUT_AUDIO):
        print(f"❌ Audio file '{INPUT_AUDIO}' not found!", file=sys.stderr)
        sys.exit(1)

    # Step 1: Convert audio if needed
    convert_audio(INPUT_AUDIO, CONVERTED_AUDIO)

    # Step 2: Load Whisper model
    model = load_whisper_model()

    # Step 3: Transcribe converted audio
    transcription = transcribe_audio(model, CONVERTED_AUDIO)

    # Step 4: Save output
    save_transcription(transcription, JSON_OUTPUT)

    print("📝 Transcription:", transcription)  # Print transcription
