"use client";

import { useState } from "react";
import { extractTextFromImage } from "@/lib/ocr";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const extracted = await extractTextFromImage(file);
      setText(extracted);
      toast.success("Text extracted!");
    } catch (err) {
      toast.error("OCR failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">📤 Upload Receipt</h2>
      <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      <Button onClick={handleExtract} disabled={!file || loading}>
        {loading ? "Extracting..." : "Extract Text"}
      </Button>
      {text && (
        <div className="border p-3 rounded bg-muted text-sm whitespace-pre-wrap">
          <strong>Extracted Text:</strong>
          <br />
          {text}
        </div>
      )}
    </Card>
  );
}