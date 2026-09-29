import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing from environment variables.");
  return key;
};

// ---------- 1. Text-only Gemini Request ----------
export async function fetchGeminiText(prompt) {
  const apiKey = getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      throw new Error("Gemini API failed to return text.");
    }
    return text;
  } catch (err) {
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await fallbackModel.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (fallbackErr) {
      console.error("Gemini API Error:", err);
      throw err;
    }
    throw err;
  }
}

// ---------- 2. File + Prompt Gemini Request ----------
export async function fetchGeminiWithInlineData(params) {
  const { base64, mimeType, prompt } = params;
  const apiKey = getGeminiApiKey();

  const genAI = new GoogleGenerativeAI(apiKey);
  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  } catch {
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Clean the base64 string if it contains the data URL prefix
  let cleanBase64 = base64;
  if (base64.includes("base64,")) {
    cleanBase64 = base64.split("base64,")[1];
  }

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType
        }
      }
    ]);

    const text = result.response.text();

    if (!text) {
      throw new Error("Gemini API failed to return text from file.");
    }

    return text;
  } catch (err) {
    console.error("Gemini Inline Data API Error:", err);
    throw err;
  }
}