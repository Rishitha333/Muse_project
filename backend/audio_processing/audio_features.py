import librosa
import numpy as np

def extract_audio_features(audio_path):
    """
    Extract audio features (pitch, energy, MFCCs) from an audio file
    """
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=None)

        # Extract pitch (fundamental frequency)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        # Extract energy (RMS)
        rms = librosa.feature.rms(y=y)
        energy_values = rms[0].tolist()

        # Extract MFCCs (for additional features)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfccs, axis=1).tolist()

        return {
            "pitch": pitch_values,
            "energy": energy_values,
            "mfcc": mfcc_mean
        }

    except Exception as e:
        print("Audio feature extraction error:", e)
        import traceback
        traceback.print_exc()
        return None

def compute_audio_tone_score(features):
    """
    Convert raw audio features into a sarcasm-related tone score(0–1)
    """
    try:
        if not features or not isinstance(features, dict):
            return 0.0
            
        pitch = np.mean(features.get("pitch", [0]))
        energy = np.mean(features.get("energy", [0]))

        # Normalize values (simple heuristic)
        pitch_score = min(pitch / 300, 1.0) if pitch > 0 else 0.0 
        energy_score = min(energy / 0.1, 1.0) if energy > 0 else 0.0

        tone_score = 0.5 * pitch_score + 0.5 * energy_score
        return round(tone_score, 3)

    except Exception as e:
        print("Tone score computation error:", e)
        return 0.0
