import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { ObjectId } from "mongodb";

// Type definitions
type VoteDoc = {
  logId: string; // ID of the comment log
  userId?: string; // Optional user ID or IP hash
  vote: "sexist" | "notSexist";
  createdAt: Date;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, vote } = body as {
      logId: string;
      userId?: string;
      vote: "sexist" | "notSexist";
    };

    if (!logId || !vote) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const votesCollection = db.collection<VoteDoc>("votes");
    const logsCollection = db.collection("logs");

    // Optional: Check if user has already voted on this log (if userId provided)
    if (userId) {
      const existingVote = await votesCollection.findOne({ logId, userId });
      if (existingVote) {
        return NextResponse.json({ error: "User has already voted" }, { status: 409 });
      }
    }

    // Insert vote document
    const voteDoc: VoteDoc = {
      logId,
      userId,
      vote,
      createdAt: new Date(),
    };

    await votesCollection.insertOne(voteDoc);

    // Update vote counts in logs collection
    const voteField = vote === "sexist" ? "votes.sexist" : "votes.notSexist";
    await logsCollection.updateOne(
      { _id: new ObjectId(logId) },
      { $inc: { [voteField]: 1 } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
