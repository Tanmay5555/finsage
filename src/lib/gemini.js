import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- 1. Text-only Gemini Request ----------
export async function fetchGeminiText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("Gemini API failed to return text.");
  }

  return text;
}

// ---------- 2. File + Prompt Gemini Request ----------
export async function fetchGeminiWithInlineData(params)



{
  const { base64, mimeType, prompt } = params;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Clean the base64 string if it contains the data URL prefix
  let cleanBase64 = base64;
  if (base64.includes("base64,")) {
    cleanBase64 = base64.split("base64,")[1];
  }

  const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      data: cleanBase64,
      mimeType
    }
  }]
  );

  const text = result.response.text();

  if (!text) {
    throw new Error("Gemini API failed to return text from file.");
  }

  return text;
}