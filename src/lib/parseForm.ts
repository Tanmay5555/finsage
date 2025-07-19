import { IncomingForm } from "formidable";
import { Readable } from "stream";

export async function parseForm(request: Request): Promise<{ fields: any; files: any }> {
  const contentType = request.headers.get("content-type") || "";
  const contentLength = request.headers.get("content-length") || "";

  const buffers: Uint8Array[] = [];
  const reader = request.body?.getReader();

  if (!reader) throw new Error("Request body reader not available");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) buffers.push(value);
  }

  const stream = Readable.from(Buffer.concat(buffers));

  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  // Pass headers manually for formidable to work
  (stream as any).headers = {
    "content-type": contentType,
    "content-length": contentLength,
  };

  return new Promise((resolve, reject) => {
    form.parse(stream as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
