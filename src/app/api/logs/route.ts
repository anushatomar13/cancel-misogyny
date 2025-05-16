import clientPromise from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

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
  userId: string; // Add userId
};

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const logs = db.collection<LogDoc>("logs");

    const { searchParams } = new URL(request.url);

    const tag = searchParams.get("tag");
    const minScore = searchParams.get("minScore");
    const userId = searchParams.get("userId"); // Get userId param

    const query: Record<string, unknown> = {};
    if (tag) query.tags = tag;
    if (minScore) query["ai_analysis.sexism_score"] = { $gte: Number(minScore) };
    if (userId) query.userId = userId; // Filter by userId

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
