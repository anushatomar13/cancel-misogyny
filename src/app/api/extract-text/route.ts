import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import path from "path";

// Helper to decode base64 image data
function base64ToBuffer(base64: string): Buffer {
  try {
    // Remove data:image/...;base64, if present
    const matches = base64.match(/^data:(.+);base64,(.*)$/);
    const data = matches ? matches[2] : base64;
    return Buffer.from(data, "base64");
  } catch (error) {
    throw new Error("Invalid base64 image data");
  }
}

// Helper to validate image format
function validateImageFormat(base64: string): boolean {
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const matches = base64.match(/^data:(.+);base64,/);
  if (!matches) return false;
  return validFormats.includes(matches[1].toLowerCase());
}

export async function POST(request: NextRequest) {
  let worker = null;
  
  try {
    const body = await request.json();
    const { imageBase64 } = body as { imageBase64: string };

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Validate image format
    if (!validateImageFormat(imageBase64)) {
      return NextResponse.json({ 
        error: "Unsupported image format. Please use JPEG, PNG, GIF, or WebP." 
      }, { status: 400 });
    }

    // Create a Tesseract worker with explicit workerPath
    worker = await createWorker("eng", 1, {
      workerPath: path.join(process.cwd(), "node_modules/tesseract.js/src/worker-script/node/index.js"),
      logger: m => console.log(m) // Enable logging for debugging
    });

    // Configure Tesseract for better text recognition
    await worker.setParameters({
      tessedit_page_seg_mode: '1', // Automatic page segmentation with OSD
      tessedit_ocr_engine_mode: '2', // Use LSTM OCR engine
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?@#$%^&*()_+-=[]{}|;:\'\"<>/\\`~'
    });

    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(imageBase64);
    
    // Validate buffer size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Image too large. Please use an image smaller than 10MB." 
      }, { status: 400 });
    }

    // Run OCR on the image buffer
    const { data } = await worker.recognize(imageBuffer);

    // Clean and validate the extracted text
    const text = data.text.trim();
    
    if (!text || text.length === 0) {
      return NextResponse.json({ 
        error: "No text found in the image. Please ensure the image contains readable text." 
      }, { status: 400 });
    }

    console.log(`OCR successful. Extracted ${text.length} characters.`);

    return NextResponse.json({ 
      text,
      confidence: data.confidence,
      wordCount: text.split(/\s+/).length
    }, { status: 200 });

  } catch (err) {
    console.error("OCR Error:", err);
    
    if (err instanceof Error) {
      if (err.message.includes("Invalid base64")) {
        return NextResponse.json({ 
          error: "Invalid image data format" 
        }, { status: 400 });
      }
      if (err.message.includes("Worker failed")) {
        return NextResponse.json({ 
          error: "OCR processing failed. Please try with a clearer image." 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: "OCR processing failed. Please try again with a different image." 
    }, { status: 500 });
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.error("Error terminating OCR worker:", terminateError);
      }
    }
  }
}
