import os
import sys

# Allow access to parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pandas as pd
from text_processing.text_sarcasm import extract_text_features, predict_sarcasm

current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "airline_balanced_3class.csv")

df = pd.read_csv(dataset_path)

results = []

for i in range(200):  # sample subset
    text = df.iloc[i]["clean_text"]
    sentiment = df.iloc[i]["sentiment_label"]

    embedding = extract_text_features(text)
    sarcasm_score = predict_sarcasm(embedding)

    results.append((sentiment, sarcasm_score))

analysis_df = pd.DataFrame(results, columns=["sentiment", "sarcasm_score"])

avg_scores = analysis_df.groupby("sentiment")["sarcasm_score"].mean()

print(avg_scores)