import os
import subprocess
from typing import Tuple, List, Tuple as TupleType

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf
import json
import datetime


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


def vad_with_librosa(y: np.ndarray, sr: int, top_db: int = 40, min_segment_duration: float = 0.3) -> List[TupleType[float, float]]:
    """
    Energy-based VAD using librosa.effects.split.
    Returns list of (start_s, end_s) segments of detected speech.
    """
    intervals = librosa.effects.split(y, top_db=top_db)
    segments: List[TupleType[float, float]] = []
    for start_i, end_i in intervals:
        duration_s = (end_i - start_i) / sr
        if duration_s >= min_segment_duration:
            segments.append((start_i / sr, end_i / sr))
    return segments


def concatenate_segments(y: np.ndarray, sr: int, segments: List[TupleType[float, float]]) -> np.ndarray:
    """Concatenate audio samples for the given (start_s, end_s) segments."""
    if not segments:
        return np.array([], dtype=y.dtype)
    chunks = []
    for start_s, end_s in segments:
        start_idx = int(round(start_s * sr))
        end_idx = int(round(end_s * sr))
        chunks.append(y[start_idx:end_idx])
    if not chunks:
        return np.array([], dtype=y.dtype)
    return np.concatenate(chunks)


def get_noise_profile(y: np.ndarray, sr: int, duration: float = 0.5) -> np.ndarray:
    """
    Return a noise profile of `duration` seconds from the start if possible,
    otherwise estimate from the lowest-energy region.
    """
    n_samples = int(duration * sr)
    if len(y) >= n_samples and n_samples > 0:
        return y[:n_samples]
        
    energy = librosa.feature.rms(y=y)[0]
    hop_length = 512
    if energy.size == 0:
        return y
    min_frame = int(np.argmin(energy))
    start = max(0, min_frame * hop_length - n_samples // 2)
    end = min(len(y), start + max(n_samples, 1))
    return y[start:end]


def normalize_peak(y: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Peak-normalize the signal so max(abs(y)) == target_peak (if possible)."""
    if y.size == 0:
        return y
    peak = float(np.max(np.abs(y)))
    if peak == 0:
        return y
    y_norm = y / peak
    return y_norm * target_peak


def process_audio(input_path: str, output_path: str, target_sr: int = 16000) -> Tuple[float, int]:
    """
    1) Optional format conversion to WAV via ffmpeg
    2) Load mono audio at native sr
    3) VAD (energy-based) to remove long silences → speech-only signal
    4) Noise reduction using spectral gating with a noise profile from the raw signal
    5) Peak normalization to ~0.95
    6) Resample to target_sr (default 16kHz)
    7) Save 16-bit PCM WAV and a sidecar JSON metadata file

    Returns (final_duration_seconds, final_sample_rate).

    Supports various input formats (WebM, MP3, WAV, etc.) by converting first if needed.
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
        
        # Load audio at native sr, mono for pipeline simplicity
        y, sr = librosa.load(load_path, sr=None, mono=True)

        # Step 1: VAD segmentation (energy-based)
        segments = vad_with_librosa(y, sr, top_db=40, min_segment_duration=0.3)
        y_vad = concatenate_segments(y, sr, segments)

        # Step 2: Noise reduction (build noise profile from the raw signal)
        noise_profile = get_noise_profile(y, sr, duration=0.5)

        # Choose target for denoise: speech-only if available else original
        target_for_denoise = y_vad if y_vad.size > 0 else y
        try:
            y_denoised = nr.reduce_noise(y=target_for_denoise, y_noise=noise_profile, sr=sr)
        except Exception:
            y_denoised = target_for_denoise

        # Step 3: Peak normalization to ~0.95
        y_normalized = normalize_peak(y_denoised, target_peak=0.95)

        # Step 4: Resample to target sample rate
        if sr != target_sr:
            y_resampled = librosa.resample(y=y_normalized, orig_sr=sr, target_sr=target_sr)
            final_sr = target_sr
        else:
            y_resampled = y_normalized
            final_sr = sr

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save as 16-bit PCM WAV
        sf.write(output_path, y_resampled, final_sr, subtype="PCM_16")

        duration = float(len(y_resampled) / final_sr)

        # Step 5: Save sidecar metadata JSON next to output file
        metadata = {
            "input_file": os.path.abspath(input_path),
            "output_file": os.path.abspath(output_path),
            "original_sr": int(sr),
            "original_duration_sec": float(len(y) / sr) if sr else None,
            "final_sr": int(final_sr),
            "final_duration_sec": duration,
            "processing_date_utc": datetime.datetime.now(datetime.UTC).isoformat(),
            "processing_steps": [
                "VAD(librosa.effects.split)",
                "NoiseReduction(noisereduce)",
                "Normalization(peak 0.95)",
                "Resample(16kHz)",
                "Save(16-bit PCM)"
            ],
        }
        try:
            meta_path = os.path.splitext(output_path)[0] + "_metadata.json"
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)
        except Exception:
            # Metadata saving failure should not block the main processing
            pass
        
        # Clean up converted file if it was created
        if converted_path and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
            except Exception:
                pass  # Ignore cleanup errors
        
        return duration, final_sr
    except Exception as e:
        # Clean up converted file if it was created
        if converted_path and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
            except Exception:
                pass
        raise


