import os
import pandas as pd
import joblib
import seaborn as sns
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Locate dataset
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
dataset_path = os.path.join(project_root, "datasets", "airline_balanced_3class.csv")

# Load dataset
data = pd.read_csv(dataset_path)

X = data["clean_text"]
y = data["sentiment_label"]

# Train-test split (80-20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Build model
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        stop_words="english",
        max_features=10000,
        ngram_range=(1,2)
    )),
    ("clf", LogisticRegression(
        max_iter=3000
    ))
])

# Train
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Metrics
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)
matrix = confusion_matrix(y_test, y_pred)

print("\nAccuracy:", accuracy)
print("\nClassification Report:\n", report)
print("\nConfusion Matrix:\n", matrix)

# Save model
model_path = os.path.join(project_root, "backend", "models", "sentiment_classifier.pkl")
joblib.dump(model, model_path)

# Save confusion matrix image
plt.figure(figsize=(6,5))
sns.heatmap(matrix, annot=True, fmt='d', cmap='Blues')
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix - 3-Class Sentiment")
plt.tight_layout()
plt.savefig("confusion_matrix_airline_3class.png")

print("\nModel saved successfully!")
