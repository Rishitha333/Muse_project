from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load once (global)
MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()

LABELS = ["Negative", "Neutral", "Positive"]

def predict_sentiment(text: str):
    """
    Returns:
      sentiment_label: Positive / Neutral / Negative
      sentiment_score: confidence (0–1)
    """
    if not text or not isinstance(text, str):
        return "Neutral", 0.0

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)[0]

    score, label_idx = torch.max(probs, dim=0)

    return LABELS[label_idx.item()], round(float(score), 3)
