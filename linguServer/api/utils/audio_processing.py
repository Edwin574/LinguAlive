import os
from typing import Tuple

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf


def process_audio(input_path: str, output_path: str, target_sr: int = 16000) -> Tuple[float, int]:
    """
    Load audio, convert to mono, resample, perform noise reduction, normalize,
    and save as 16-bit PCM WAV. Returns (duration_seconds, sample_rate).
    """
    # Load audio (let librosa handle resampling later)
    y, sr = librosa.load(input_path, sr=None, mono=True)

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
    return duration, sr


