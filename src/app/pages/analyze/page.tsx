"use client";
import { useState } from "react";

type AIResult = {
  sexism_score: number;
  explanation: string;
  counter_comments: string[];
  tags: string[];
};

export default function AnalyzePage() {
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    let text = comment;

    // If image is uploaded, extract text first
    if (image) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const ocrRes = await fetch("/api/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        if (!ocrRes.ok) {
          setError("OCR failed.");
          setLoading(false);
          return;
        }
        const ocrData = await ocrRes.json();
        text = ocrData.text;
        analyzeText(text);
      };
      reader.readAsDataURL(image);
      return;
    }

    analyzeText(text);

    async function analyzeText(textToAnalyze: string) {
      const res = await fetch("/api/analyze-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });
      if (!res.ok) {
        setError("Failed to analyze comment.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResult(data);
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 500, margin: "2rem auto", padding: "2rem", border: "1px solid #eee", borderRadius: 10 }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Analyze a Comment</h2>
      <form onSubmit={handleAnalyze}>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          placeholder="Paste a comment here..."
        />
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 6,
            border: "none",
            background: "#6366f1",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
      {result && (
        <div style={{ marginTop: "2rem", background: "#f9fafb", padding: "1rem", borderRadius: 8 }}>
          <p><strong>Sexism Score:</strong> {result.sexism_score}</p>
          <p><strong>Explanation:</strong> {result.explanation}</p>
          <p><strong>Tags:</strong> {result.tags.join(", ")}</p>
          <div>
            <strong>Counter Comments:</strong>
            <ul>
              {result.counter_comments.map((cc, i) => (
                <li key={i}>- {cc}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
