import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

type VoteDoc = {
  logId: string;
  userId: string;
  vote: "sexist" | "notSexist";
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const votesCollection = db.collection<VoteDoc>("votes");

    // Get all votes for this user
    const userVotes = await votesCollection
      .find({ userId })
      .toArray();

    return NextResponse.json({ votes: userVotes }, { status: 200 });
  } catch (err) {
    console.error("Error fetching user votes:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Add this to your API route file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, vote } = body;

    if (!logId || !userId || !vote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const votesCollection = db.collection<VoteDoc>("votes");

    // Insert or update vote
    const result = await votesCollection.replaceOne(
      { logId, userId },
      { logId, userId, vote, createdAt: new Date() },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error saving vote:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}