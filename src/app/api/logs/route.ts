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
  userId: string;
};

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const logs = db.collection<LogDoc>("logs");

    const { searchParams } = new URL(request.url);

    const tag = searchParams.get("tag");
    const dateQuery = searchParams.get("date");
    const minScore = searchParams.get("minScore");
    const userId = searchParams.get("userId"); // Get userId param

    const query: Record<string, unknown> = {};
    
    // Tag filtering
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Date filtering - filter by specific date
    if (dateQuery) {
      const startDate = new Date(dateQuery);
      const endDate = new Date(dateQuery);
      endDate.setDate(endDate.getDate() + 1); // Next day
      
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Score filtering
    if (minScore) {
      query["ai_analysis.sexism_score"] = { $gte: Number(minScore) };
    }
    
    // User filtering (if you want to show only specific user's logs)
    if (userId) {
      query.userId = userId;
    }

    const logDocs = await logs
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ logs: logDocs }, { status: 200 });
  } catch (err) {
    console.error("Error fetching logs:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}