import pandas as pd
import numpy as np
import torch
from transformers import BertTokenizer, BertModel
from tqdm import tqdm

# Load iSarcasm dataset (only dataset used in the project)
df = pd.read_csv("data/sarcasm_dataset.csv")

texts = df["tweet"].fillna("").astype(str).tolist()
labels = df["sarcastic"].astype(int).tolist()

# Remove empty rows
clean_texts = []
clean_labels = []

for t, l in zip(texts, labels):
    if isinstance(t, str) and t.strip() != "":
        clean_texts.append(t)
        clean_labels.append(l)

texts = clean_texts
labels = clean_labels

print(f"Using {len(texts)} valid samples")

# Load mBERT
tokenizer = BertTokenizer.from_pretrained("bert-base-multilingual-cased")
model = BertModel.from_pretrained("bert-base-multilingual-cased")
model.eval()

embeddings = []

print("Generating embeddings...")
for text in tqdm(texts):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )
    with torch.no_grad():
        outputs = model(**inputs)

    cls_embedding = outputs.last_hidden_state[:, 0, :]
    embeddings.append(cls_embedding.squeeze().numpy())

# Save files
np.save("data/text_embeddings.npy", np.array(embeddings))
np.save("data/sarcasm_labels.npy", np.array(clean_labels))

print("✅ Embeddings & labels saved successfully")
