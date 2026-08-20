import os
import pandas as pd

current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "isarcasm2022.csv")

print("Looking for file at:", dataset_path)

data = pd.read_csv(dataset_path)

print("Shape:", data.shape)
print("\nColumns:\n", data.columns)
print("\nSample Rows:\n", data.head())

# Try to automatically detect label column
for col in data.columns:
    if "label" in col.lower() or "sarcasm" in col.lower():
        print("\nPossible Label Column:", col)
        print(data[col].value_counts())
