import clientPromise from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// Types (reuse from previous step if in a shared types file)
type AIAnalysis = {
  sexism_score: number;
  counter_comments: string[];
  tags: string[];
};

type LogDoc = {
  text: string;
  explanation: string;
  ai_analysis: AIAnalysis;
  tags: string[];
  votes: { sexist: number; notSexist: number };
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const logs = db.collection<LogDoc>("logs");

    // Optional: filter by tag or severity via query params
    const { searchParams } = new URL(request.url);

    const tag = searchParams.get("tag");
    const minScore = searchParams.get("minScore");

    // Build query object
const query: Record<string, unknown> = {};
    if (tag) query.tags = tag;
    if (minScore) query["ai_analysis.sexism_score"] = { $gte: Number(minScore) };

    // Fetch logs, most recent first
    const logDocs = await logs
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ logs: logDocs }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
