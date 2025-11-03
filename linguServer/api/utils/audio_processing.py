import os
import subprocess
from typing import Tuple

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf


def convert_to_wav(input_path: str, output_path: str = None) -> str:
    """
    Convert audio file to WAV format using ffmpeg.
    Returns the path to the converted file.
    """
    if output_path is None:
        # Create temporary file for conversion
        base_name = os.path.splitext(input_path)[0]
        output_path = f"{base_name}_converted.wav"
    
    # Use ffmpeg to convert to WAV
    try:
        subprocess.run(
            [
                'ffmpeg',
                '-i', input_path,
                '-y',  # Overwrite output file
                '-acodec', 'pcm_s16le',  # 16-bit PCM
                '-ar', '44100',  # Sample rate
                '-ac', '1',  # Mono
                output_path
            ],
            check=True,
            capture_output=True,
            stderr=subprocess.PIPE
        )
        return output_path
    except subprocess.CalledProcessError as e:
        # If ffmpeg fails, try librosa directly (might work for some formats)
        raise ValueError(f"Audio conversion failed: {e.stderr.decode() if e.stderr else str(e)}")
    except FileNotFoundError:
        raise ValueError("ffmpeg is not installed. Please install ffmpeg to process audio files.")


def process_audio(input_path: str, output_path: str, target_sr: int = 16000) -> Tuple[float, int]:
    """
    Load audio, convert to mono, resample, perform noise reduction, normalize,
    and save as 16-bit PCM WAV. Returns (duration_seconds, sample_rate).
    
    Supports various input formats (WebM, MP3, WAV, etc.) by converting to WAV first if needed.
    """
    # Check if file needs conversion (WebM, MP3, etc.)
    file_ext = os.path.splitext(input_path)[1].lower()
    needs_conversion = file_ext in ['.webm', '.mp3', '.m4a', '.ogg', '.flac']
    
    converted_path = None
    try:
        if needs_conversion:
            # Convert to WAV first
            converted_path = convert_to_wav(input_path)
            load_path = converted_path
        else:
            load_path = input_path
        
        # Load audio (let librosa handle resampling later)
        y, sr = librosa.load(load_path, sr=None, mono=True)

        # Resample to target sample rate
        if sr != target_sr:
            y = librosa.resample(y=y, orig_sr=sr, target_sr=target_sr)
            sr = target_sr

        # Estimate noise from a quiet segment (first 0.5s) if long enough
        noise_profile = None
        if y.size > sr // 2:
            noise_profile = y[: sr // 2]

        # Noise reduction using spectral gating
        try:
            if noise_profile is not None:
                y = nr.reduce_noise(y=y, y_noise=noise_profile, sr=sr)
            else:
                y = nr.reduce_noise(y=y, sr=sr)
        except Exception:
            # If noise reduction fails for any reason, proceed with the original signal
            pass

        # Peak normalization to -1.0..1.0
        peak = np.max(np.abs(y)) or 1.0
        y = (y / peak) * 0.98

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save as 16-bit PCM WAV
        sf.write(output_path, y, sr, subtype="PCM_16")

        duration = float(len(y) / sr)
        
        # Clean up converted file if it was created
        if converted_path and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
            except Exception:
                pass  # Ignore cleanup errors
        
        return duration, sr
    except Exception as e:
        # Clean up converted file if it was created
        if converted_path and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
            except Exception:
                pass
        raise


