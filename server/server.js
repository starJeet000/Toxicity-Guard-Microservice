// server.js
import express from 'express';
import cors from 'cors';
import { checkToxicity } from './detect.js';

const app = express();
const PORT = process.env.PORT || 3005; 

app.use(cors());
app.use(express.json());

app.post('/api/validate-comment', async (req, res) => {
  try {
    const { comment } = req.body;

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

// Start the server and listen for startup errors
const server = app.listen(PORT, () => {
  console.log(`🛡️  Toxicity Guard running on http://localhost:${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try killing the old process or changing the PORT.`);
  } else {
    console.error('❌ Server failed to start:', e);
  }
});

