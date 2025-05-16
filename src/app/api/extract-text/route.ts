import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

// Helper to decode base64 image data
function base64ToBuffer(base64: string): Buffer {
  // Remove data:image/...;base64, if present
  const matches = base64.match(/^data:.+;base64,(.*)$/);
  const data = matches ? matches[1] : base64;
  return Buffer.from(data, "base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body as { imageBase64: string };

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Create a Tesseract worker
    const worker = await createWorker("eng");

    // Run OCR on the image buffer
    const { data } = await worker.recognize(base64ToBuffer(imageBase64));
    await worker.terminate();

    // Clean the extracted text
    const text = data.text.trim();

    return NextResponse.json({ text }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "OCR error" }, { status: 500 });
  }
}
