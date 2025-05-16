import clientPromise from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// Type definitions for incoming data
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, explanation, ai_analysis, tags, userId } = body as {
      text: string;
      explanation: string;
      ai_analysis: AIAnalysis;
      tags: string[];
      userId: string;
    };

    if (!text || !explanation || !ai_analysis || !tags || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const logs = db.collection<LogDoc>("logs");

    const logDoc: LogDoc = {
      text,
      explanation,
      ai_analysis,
      tags,
      votes: { sexist: 0, notSexist: 0 },
      createdAt: new Date(),
      userId, // Store userId
    };

    const result = await logs.insertOne(logDoc);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
