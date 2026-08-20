import os
import pandas as pd

# Locate dataset
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "Tweets.csv")

print("Looking for file at:", dataset_path)

data = pd.read_csv(dataset_path)

print("Shape:", data.shape)
print("\nColumns:\n", data.columns)
print("\nSentiment Distribution:\n", data["sentiment_label"].value_counts())
