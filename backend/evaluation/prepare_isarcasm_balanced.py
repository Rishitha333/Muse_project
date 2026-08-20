import os
import pandas as pd
from sklearn.utils import resample

# Locate dataset dynamically
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "isarcasm2022.csv")

# Load dataset
data = pd.read_csv(dataset_path)

# Keep only required columns
data = data[["tweet", "sarcasm"]]
data = data.dropna()

print("Original Distribution:")
print(data["sarcasm"].value_counts())

# Separate classes
sarcastic = data[data["sarcasm"] == 1.0]
non_sarcastic = data[data["sarcasm"] == 0.0]

# Oversample minority class (non-sarcastic)
non_sarcastic_upsampled = resample(
    non_sarcastic,
    replace=True,                # allow duplication
    n_samples=len(sarcastic),    # match majority class
    random_state=42
)

# Combine
balanced_data = pd.concat([sarcastic, non_sarcastic_upsampled])

# Shuffle
balanced_data = balanced_data.sample(frac=1, random_state=42).reset_index(drop=True)

print("\nBalanced Distribution:")
print(balanced_data["sarcasm"].value_counts())

# Save
output_path = os.path.join(project_root, "datasets", "isarcasm_balanced.csv")
balanced_data.to_csv(output_path, index=False)

print("\nBalanced dataset saved successfully as isarcasm_balanced.csv")
