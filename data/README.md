# Data

Datasets are not committed to this repository, as both contain tweet text
subject to platform terms. Download them and place them here before training.

## 1. Sarcasm detection — iSarcasmEval

SemEval-2022 Task 6. 3,468 tweets with binary sarcasm labels, a human-written
non-sarcastic rephrasing of each sarcastic tweet, and finer-grained categories:
irony, satire, understatement, overstatement, rhetorical question.

Source: https://github.com/iabufarha/iSarcasmEval

> Oprea, S., & Magdy, W. (2022). iSarcasmEval: Intended Sarcasm Detection in
> English and Arabic. SemEval-2022 Task 6.

Place as `data/isarcasm2022.csv`.

## 2. Sentiment — Twitter US Airline Sentiment

Original: https://www.kaggle.com/datasets/crowdflower/twitter-airline-sentiment
(14,640 tweets, imbalanced, ~63% negative)

This project uses a processed version: text lowercased with punctuation and
mentions removed, labels mapped to 0 = negative, 1 = neutral, 2 = positive, and
classes balanced to 9,019 each (27,057 total) so the classifier is not biased
toward the majority negative class.

Regenerate it with:

    python backend/prepare_airline_data.py

Place the result as `data/airline_balanced_3class.csv`.

## Generated files

`text_embeddings.npy` and `sarcasm_labels.npy` are produced from the above and
are not committed.