import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("receipt") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join(tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || "{}");

    const client = new ImageAnnotatorClient({
      credentials,
    });


    const [result] = await client.textDetection(tempFilePath);
    const text = result.textAnnotations?.[0]?.description || "";

    // Intelligent parsing
    const lines = text.split("\n").map((line) => line.trim());
    const relevantLines = lines.filter((line) =>
      /total|amount|earning|income|paid/i.test(line)
    );

    let detectedAmount = null;
    for (let line of relevantLines) {
      const match = line.match(/([₹₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (match) {
        detectedAmount = match[1].replace(/[^0-9.]/g, "");
        break;
      }
    }

    return NextResponse.json({
      text,
      extractedAmount: detectedAmount || null,
    });
  } catch (err) {
    console.error("OCR route error:", err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
