import numpy as np
import joblib
import os
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

DATA_DIR = "data"
MODEL_DIR = "backend/models"

os.makedirs(MODEL_DIR, exist_ok=True)

# Load embeddings + labels
X = np.load(os.path.join(DATA_DIR, "text_embeddings.npy"))
y = np.load(os.path.join(DATA_DIR, "sarcasm_labels.npy"))

print("Embeddings shape:", X.shape)
print("Labels shape:", y.shape)

# Train / test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Training sarcasm classifier...")

# Logistic Regression (strong baseline)
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

# Evaluation
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))
print("Accuracy:", round(acc, 3))

# Save model
model_path = os.path.join(MODEL_DIR, "sarcasm_classifier.pkl")
joblib.dump(clf, model_path)

print(f"✅ Trained model saved at: {model_path}")
