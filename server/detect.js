// detect.js
import "dotenv/config"; // Load environment variables first
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_API_KEY);

export async function checkToxicity(text) {
  console.log(`\n🔍 Analyzing: "${text}"...`);

  try {
    const result = await hf.textClassification({
      model: 'unitary/toxic-bert',
      inputs: text
    });

    // Flatten array in case the API returns nested results [[{...}]]
    const scores = Array.isArray(result) ? result.flat() : [result];

    // Sort by highest confidence score to find the primary classification
    const sorted = scores.sort((a, b) => b.score - a.score);
    const topMatch = sorted[0];

    if (topMatch.score > 0.7) {
      // It is toxic. Return the specific toxicity label (e.g., 'insult', 'toxic').
      return { 
        isToxic: true, 
        label: topMatch.label, 
        score: parseFloat(topMatch.score.toFixed(4)) 
      };
    } else {
      // It is clean. Calculate clean confidence based on the lack of toxicity.
      const cleanConfidence = 1 - topMatch.score;
      return { 
        isToxic: false, 
        label: 'clean', 
        score: parseFloat(cleanConfidence.toFixed(4)) 
      };
    }

  } catch (error) {
    console.error("❌ Error Connecting to Hugging Face:", error.message);
    return null;
  }
}