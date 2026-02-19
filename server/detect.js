// detect.js
import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const hf = new HfInference(process.env.HF_API_KEY);

export async function checkToxicity(text) {
  console.log(`\n🔍 Analyzing: "${text}"...`);

  try {
    const result = await hf.textClassification({
      model: 'unitary/toxic-bert',
      inputs: text
    });

    // Flatten array in case the API returns nested results [[{...}]]
    const scores = Array.isArray(result) ? result.flat() : [result];

    // Sort by highest confidence score
    const sorted = scores.sort((a, b) => b.score - a.score);
    const topMatch = sorted[0];

    if (topMatch.score > 0.7) {
      // It is toxic. Return the high toxicity score.
      return { isToxic: true, label: topMatch.label, score: topMatch.score };
    } else {
      // It is clean. Invert the score (100% - toxicity chance = clean chance)
      const cleanConfidence = 1 - topMatch.score;
      return { isToxic: false, label: 'clean', score: cleanConfidence };
    }

  } catch (error) {
    console.error("❌ Error Connecting to Hugging Face:", error.message);
    return null;
  }
}