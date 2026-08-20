# MUSE — Multilingual Sentiment & Sarcasm Engine

> *Beyond words into emotions*

Speech analysis for languages where "fine" rarely means fine.

MUSE takes an audio recording or a piece of text, works out what was said, what was
meant, and whether the two agree. It transcribes speech, translates across seven
languages, classifies sentiment, and detects sarcasm by reading the words and the
voice against each other.

---

## The problem

Sentiment analysis is largely solved for plain statements. It falls apart on sarcasm,
because sarcasm is a disagreement between signals: the words carry one meaning and the
delivery carries the opposite. Read the transcript alone and *"brilliant, another
delay"* looks positive.

That gets harder in a multilingual setting. A call centre in India might receive Tamil,
Telugu, Hindi, Kannada, Malayalam, and Marathi in the same afternoon, and a
model trained on English tweets has nothing useful to say about any of them.

MUSE takes both problems seriously:

- **Two signals, read separately, then fused.** Text sarcasm probability comes from
  mBERT embeddings and a trained classifier. Tone comes from pitch and energy features
  extracted with Librosa. They are combined by weighted late fusion.
- **Seven languages, routed to the right model.** Speech is transcribed with Whisper,
  then translated by NLLB-200 or Marian depending on the language pair.

---

## Pipeline

```
   audio file                          raw text
       │                                   │
       ▼                                   │
┌──────────────┐                           │
│   Whisper    │  transcribe + detect lang │
│ faster-whisper│                          │
└──────┬───────┘                           │
       │                                   │
       ├───────────────┬───────────────────┘
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│  Librosa    │  │ Translation  │  NLLB-200 / Marian
│ pitch,      │  │ router       │
│ energy,     │  └──────┬───────┘
│ MFCC        │         │
└──────┬──────┘         ├────────────────┐
       │                ▼                ▼
       │        ┌───────────────┐ ┌─────────────┐
       │        │ mBERT + LR    │ │  RoBERTa    │
       │        │ sarcasm prob. │ │  sentiment  │
       │        └───────┬───────┘ └──────┬──────┘
       │                │                │
       ▼                ▼                │
   ┌─────────────────────────┐           │
   │   Late fusion           │           │
   │   0.6·text + 0.4·audio  │           │
   └───────────┬─────────────┘           │
               │                         │
               ▼                         ▼
        ┌────────────────────────────────────┐
        │  MongoDB — analysis history        │
        └────────────────────────────────────┘
```

---

## What it does

**Speech to text.** `faster-whisper` transcribes uploaded audio and detects the source
language automatically. Supports wav, mp3, m4a, ogg, flac, and aac.

**Translation.** A router picks the model per language pair: NLLB-200 (distilled 600M)
for Indian languages, Marian for common European pairs. Supported: English, Hindi,
Tamil, Telugu, Kannada, Malayalam, Marathi.

**Sentiment.** `cardiffnlp/twitter-roberta-base-sentiment` classifies positive, neutral,
or negative with a confidence score.

**Sarcasm.** mBERT (`bert-base-multilingual-cased`) produces a CLS embedding for the
text; a logistic regression classifier trained on that embedding space returns a sarcasm
probability. The tone score from Librosa is derived from mean pitch and RMS energy.
The two are fused as `0.6 × text + 0.4 × audio`.

**Persistence and history.** Every analysis is stored per user with its transcript,
translation, scores, and detected language. Users see their own history; administrators
see everything.

**Admin panel.** System-wide statistics, all call records, sentiment and language
distribution charts, user administration with role and status control, and an activity
log recording real administrative events.

**Auth.** JWT tokens with a 24-hour expiry, passwords hashed with bcrypt at cost 12,
and role-based access control separating users from administrators.

**PDF export** of analysis results, with embedded Noto fonts so Devanagari, Tamil,
Telugu, Kannada, and Malayalam render correctly rather than as boxes.

---

## Tech stack

| Layer | Built with |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion, jsPDF |
| API | Flask, Flask-CORS |
| Speech | faster-whisper |
| Translation | NLLB-200 distilled 600M, MarianMT |
| Sentiment | RoBERTa (cardiffnlp/twitter-roberta-base-sentiment) |
| Sarcasm | mBERT embeddings + scikit-learn LogisticRegression |
| Audio features | Librosa (pitch, RMS energy, MFCC) |
| Database | MongoDB (PyMongo) |
| Auth | PyJWT, bcrypt |

---

## Running it

### Requirements

- Python 3.10 or 3.11 (3.12+ has dependency issues; 3.10 is best tested)
- Node.js 18+
- MongoDB running locally
- ~4 GB free disk for the models, downloaded automatically on first run

### 1. Clone and configure

```bash
git clone https://github.com/Rishitha333/Muse_project.git
cd Muse_project/backend
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to a long random string. The app refuses to start
without it, by design.

### 2. Backend

```bash
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
python create_all_users.py     # seeds demo accounts
python app.py
```

Runs on `http://127.0.0.1:5000`. First start downloads Whisper, mBERT, RoBERTa, and
NLLB — expect several minutes and a few GB.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| User | test@muse.com | test123 |

To create an administrator, set a user's `role` field to `admin` in MongoDB, then sign
in again — the role is carried in the JWT, so an existing session keeps the old one.

---

## Training the sarcasm classifier

The trained model is not committed. To reproduce it:

```bash
# 1. Obtain the dataset (see data/README.md) and place it at
#    data/sarcasm_dataset.csv

# 2. Generate mBERT embeddings
python training/generate_text_embeddings.py

# 3. Train the classifier
python training/train_sarcasm_classifier.py
```

This writes `backend/models/sarcasm_classifier.pkl`, which the API loads at startup.

Evaluation scripts in `backend/evaluation/` produce confusion matrices and
sentiment-vs-sarcasm scatter plots.

---

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/analyze` | optional | Analyse audio and/or text |
| GET | `/health` | none | Health check |
| POST | `/api/auth/register` | none | Create an account |
| POST | `/api/auth/login` | none | Obtain a JWT |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/history/list` | user | Own analysis history |
| GET | `/api/history/stats` | user | Own statistics |
| DELETE | `/api/history/<id>` | user | Delete own analysis |
| GET | `/api/admin/stats` | admin | System-wide statistics |
| GET | `/api/admin/users` | admin | All users with usage counts |
| PUT | `/api/admin/users/<id>/role` | admin | Change a role |
| PUT | `/api/admin/users/<id>/status` | admin | Activate / deactivate |
| GET | `/api/admin/calls` | admin | All analyses, paginated |
| GET | `/api/admin/activity` | admin | Administrative activity log |

---

## Project layout

```
backend/
  app.py                    Flask app, /analyze orchestration
  speech_to_text/           Whisper transcription
  translation/              NLLB, Marian, and the routing logic
  text_processing/          sentiment and sarcasm inference
  audio_processing/         Librosa feature extraction, tone score
  fusion/                   late fusion of text and audio signals
  auth/                     JWT generation and route decorators
  database/                 MongoDB config and models
  routes/                   auth, history, and admin blueprints
  evaluation/               training and evaluation scripts
frontend/
  src/pages/                user-facing screens
  src/pages/admin/          admin panel
  src/services/api.js       API client
  public/fonts/             Noto fonts for Indic PDF export
training/                   embedding generation and classifier training
data/                       dataset instructions (data not committed)
```

---

## Design decisions and limitations

Being straightforward about what is and is not finished.

**mBERT is used as a frozen feature extractor, not fine-tuned.** With roughly 3,400
labelled examples, fine-tuning a 178M-parameter model would overfit. Extracting CLS
embeddings and training a linear classifier on top is a stronger baseline at this data
scale, and it trains in seconds rather than hours.

**The fusion weight (0.6 text / 0.4 audio) was chosen, not learned.** Text is the
stronger signal, so it carries more weight — but the exact split has not been tuned
against a validation set. That is the next experiment worth running.

**The audio tone score is a heuristic**, normalising mean pitch and RMS energy into a
0–1 range. MFCCs are extracted but not yet used in the tone score.

**No streaming.** Audio is processed after upload, not in real time.

**Models load into memory at import**, so the first request after startup is slow and
memory use is high. Lazy loading would help.

---

## Roadmap

- [ ] Tune the fusion weight against a validation set
- [ ] Use MFCC features in the tone model rather than pitch and energy alone
- [ ] Fine-tune mBERT once more labelled data is available
- [ ] Lazy model loading and a smaller Whisper variant for faster cold starts
- [ ] Real-time streaming analysis
- [ ] Docker Compose for one-command setup

---

## Licence

MIT — see [LICENSE](LICENSE).

---

Built by **Rishitha Galicherla** ·
[GitHub](https://github.com/Rishitha333) ·
[LinkedIn](https://www.linkedin.com/in/rishitha-galicherla-363487227/)