import pandas as pd
import matplotlib.pyplot as plt
import os
import sys

# Allow access to parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from text_processing.text_sarcasm import extract_text_features, predict_sarcasm
from audio_processing.audio_features import extract_audio_features, compute_audio_tone_score
from fusion.multimodal_fusion import fuse_sarcasm

# Example: load balanced dataset
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "airline_balanced_3class.csv")
df = pd.read_csv(dataset_path)

audio_tone_scores = []
sarcasm_scores = []

# Limit to first 100 samples for visualization
for i in range(100):
    text = df.iloc[i]["clean_text"]

    # Text sarcasm
    text_embedding = extract_text_features(text)
    text_sarcasm_score = predict_sarcasm(text_embedding)

    # Simulate tone score (if no real audio file)
    tone_score = 0.5  # replace with real tone score if audio dataset exists

    audio_tone_scores.append(tone_score)
    sarcasm_scores.append(text_sarcasm_score)

# Plot
plt.figure(figsize=(6, 4))
plt.scatter(audio_tone_scores, sarcasm_scores)
plt.xlabel("Audio Tone Score")
plt.ylabel("Text Sarcasm Score")
plt.title("Tone vs Sarcasm Correlation")
plt.tight_layout()
plt.savefig("tone_vs_sarcasm_scatter.png")
plt.close()

print("Scatter plot saved successfully!")