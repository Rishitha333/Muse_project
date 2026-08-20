import os
import pandas as pd
from sklearn.utils import resample

current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "Tweets.csv")

data = pd.read_csv(dataset_path)

# Keep only needed columns
data = data[["clean_text", "sentiment_label"]]
data = data.dropna()

print("Original Distribution:")
print(data["sentiment_label"].value_counts())

# Separate classes
class_0 = data[data["sentiment_label"] == 0]
class_1 = data[data["sentiment_label"] == 1]
class_2 = data[data["sentiment_label"] == 2]

# Oversample minority classes to match majority
class_1_upsampled = resample(
    class_1,
    replace=True,
    n_samples=len(class_0),
    random_state=42
)

class_2_upsampled = resample(
    class_2,
    replace=True,
    n_samples=len(class_0),
    random_state=42
)

# Combine
balanced_data = pd.concat([class_0, class_1_upsampled, class_2_upsampled])
balanced_data = balanced_data.sample(frac=1, random_state=42).reset_index(drop=True)

print("\nBalanced Distribution:")
print(balanced_data["sentiment_label"].value_counts())

# Save
output_path = os.path.join(project_root, "datasets", "airline_balanced_3class.csv")
balanced_data.to_csv(output_path, index=False)

print("\nBalanced 3-class dataset saved successfully!")

# ---------------- VISUALIZATION ----------------
import matplotlib.pyplot as plt

# Label mapping
label_map = {
    0: "Negative",
    1: "Neutral",
    2: "Positive"
}

# -------- ORIGINAL DISTRIBUTION --------
original_counts = data["sentiment_label"].value_counts().sort_index()

plt.figure(figsize=(6, 4))
plt.bar(
    [label_map[i] for i in original_counts.index],
    original_counts.values
)
plt.title("Original Sentiment Class Distribution")
plt.xlabel("Sentiment Class")
plt.ylabel("Number of Samples")
plt.tight_layout()
plt.savefig("original_sentiment_distribution.png")
plt.close()

# -------- BALANCED DISTRIBUTION --------
balanced_counts = balanced_data["sentiment_label"].value_counts().sort_index()

plt.figure(figsize=(6, 4))
plt.bar(
    [label_map[i] for i in balanced_counts.index],
    balanced_counts.values
)
plt.title("Balanced Sentiment Class Distribution")
plt.xlabel("Sentiment Class")
plt.ylabel("Number of Samples")
plt.tight_layout()
plt.savefig("balanced_sentiment_distribution.png")
plt.close()

print("\nSentiment distribution charts saved successfully!")
