# 🛡️ Toxicity Guard API

A full-stack, AI-powered microservice designed to detect and filter toxic comments, spam, and abusive language in real-time. Built with a modern React frontend and an Express.js backend, this service utilizes the Hugging Face Inference API (`unitary/toxic-bert`) to evaluate user input before it reaches your database.

Perfect for integrating as a moderation middleware in MERN stack applications, task management boards, or social platforms.

## ✨ Features

* **Real-Time AI Analysis:** Leverages natural language processing to score text against 6 categories of toxicity (insult, threat, obscenity, etc.).
* **Smart Scoring:** Inverts mathematical confidence scores so the UI accurately displays "Confidence of Safety" vs "Confidence of Toxicity."
* **Debounced Frontend:** React UI uses a custom `useEffect` debounce timer (800ms) to prevent API spam and conserve rate limits while typing.
* **Modern JavaScript:** Fully built using ES6 Modules (`import`/`export`) across both Node.js and React environments.
* **Fail-Safe Architecture:** Express backend handles AI service outages gracefully, returning appropriate HTTP 503 status codes instead of crashing.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, plain CSS
* **Backend:** Node.js, Express.js, CORS
* **AI Integration:** `@huggingface/inference` (Hugging Face API)

---

## 🚀 Getting Started

### Prerequisites
* Node.js installed on your machine.
* A free [Hugging Face](https://huggingface.co/) API key with `read` permissions.

### 1. Backend Setup (Express API)
Navigate to your backend directory and install dependencies:
```bash
npm install

```

Create a `.env` file in the root of the backend directory and add your API key:

```env
HF_API_KEY=your_hugging_face_token_here
PORT=3005

```

Start the server:

```bash
node server.js

```

*The API will run on `http://localhost:3005*`

### 2. Frontend Setup (React UI)

Open a new terminal, navigate to your Vite React directory, and install dependencies:

```bash
npm install

```

Start the development server:

```bash
npm run dev

```

*The UI will run on `http://localhost:5173*`

---

## 📡 API Reference

### `POST /api/validate-comment`

Analyzes a string of text and returns a safety score.

**Request Body:**

```json
{
  "comment": "This is a really helpful feature!"
}

```

**Success Response (Clean Comment - 200 OK):**

```json
{
  "approved": true,
  "message": "Comment looks good!",
  "confidence": 0.998
}

```

**Rejection Response (Toxic Comment - 403 Forbidden):**

```json
{
  "approved": false,
  "message": "Comment rejected due to toxicity.",
  "reason": "insult",
  "confidence": 0.985
}

```

## 💡 Future Enhancements

* [ ] Connect to MongoDB to log rejected comments for admin review.
* [ ] Add `express-rate-limit` to prevent endpoint abuse.
* [ ] Accept dynamic strictness thresholds via the request body.
* Further More In Future.