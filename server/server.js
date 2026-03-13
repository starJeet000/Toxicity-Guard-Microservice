import express from 'express';
import cors from 'cors';
import { checkToxicity } from './detect.js';

const app = express();
const PORT = process.env.PORT || 3005; 

// 1. Improved CORS for production
app.use(cors({
  origin: '*', // Allows requests from any origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. Added Health Check (Visit this in your browser to test)
app.get('/', (req, res) => {
  res.send({ status: "Server is live and running!" });
});

app.post('/api/validate-comment', async (req, res) => {
  try {
    const { comment } = req.body;
    console.log("Incoming request for comment:", comment); // Debug log

    if (!comment) {
      return res.status(400).json({ error: "Comment is required." });
    }

    const result = await checkToxicity(comment);

    if (!result) {
      return res.status(503).json({ 
        error: "AI Service Unavailable", 
        details: "Could not connect to Hugging Face API." 
      });
    }

    if (result.isToxic) {
      return res.status(403).json({
        approved: false,
        message: "Comment rejected due to toxicity.",
        reason: result.label,
        confidence: result.score
      });
    }

    return res.status(200).json({
      approved: true,
      message: "Comment looks good!",
      confidence: result.score
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});