import numpy as np
import joblib
import os
from transformers import BertTokenizer, BertModel
import torch

# ---------------- LOAD mBERT (for embeddings) ----------------
tokenizer = BertTokenizer.from_pretrained("bert-base-multilingual-cased")
bert_model = BertModel.from_pretrained("bert-base-multilingual-cased")
bert_model.eval()

# ---------------- LOAD TRAINED CLASSIFIER ----------------
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "sarcasm_classifier.pkl"
)

sarcasm_model = joblib.load(MODEL_PATH)

# ---------------- EMBEDDING EXTRACTION ----------------
def extract_text_features(text):
    """
    Extract CLS embedding using mBERT
    """
    try:
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        )

        with torch.no_grad():
            outputs = bert_model(**inputs)

        cls_embedding = outputs.last_hidden_state[:, 0, :]
        return cls_embedding.squeeze().numpy()

    except Exception as e:
        print("Text embedding error:", e)
        return None

# ---------------- REAL SARCASM PREDICTION ----------------
def predict_sarcasm(text_embedding):
    """
    Predict sarcasm probability using trained classifier
    Returns value between 0 and 1
    """
    if text_embedding is None:
        return None

    prob = sarcasm_model.predict_proba([text_embedding])[0][1]
    return round(float(prob), 3)
