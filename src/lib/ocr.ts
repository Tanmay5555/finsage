// src/lib/ocr.ts
import Tesseract from "tesseract.js";

export async function extractTextFromImage(file: File): Promise<string> {
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => console.log(m),
  });
  return data.text;
}