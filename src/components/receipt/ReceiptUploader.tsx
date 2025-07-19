"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ReceiptUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error("Please select a receipt image.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = (reader.result as string).split(",")[1];

      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
          }),
        });

        const data = await res.json();
        if (data?.text) {
          setExtractedText(data.text);
          toast.success("Text extracted successfully!");
        } else {
          toast.error("No text found.");
        }
      } catch (err) {
        console.error("OCR error:", err);
        toast.error("Failed to extract text.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(image);
  };

  return (
    <Card className="bg-[#161b33] text-white">
      <CardHeader>
        <CardTitle className="text-xl text-white">Upload Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept="image/*" onChange={handleImageChange} className="text-white file:text-white file:bg-[#1f2547] file:border-none" />
        <Button onClick={handleUpload} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? "Extracting..." : "Extract Text"}
        </Button>

        {extractedText && (
          <Textarea
            value={extractedText}
            readOnly
            className="bg-[#1f2547] text-white mt-4"
            rows={8}
          />
        )}
      </CardContent>
    </Card>
  );
}
