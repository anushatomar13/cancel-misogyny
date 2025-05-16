import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";

type VoteDoc = {
  logId: string;
  userId: string;
  vote: "sexist" | "notSexist";
  createdAt: Date;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, vote } = body as {
      logId: string;
      userId: string;
      vote: "sexist" | "notSexist";
    };

    if (!logId || !vote || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const votesCollection = db.collection<VoteDoc>("votes");
    const logsCollection = db.collection("logs");

    const session = client.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        // Get existing vote
        const existingVote = await votesCollection.findOne(
          { logId, userId },
          { session }
        );

        // Prepare update operations
        const logUpdate: Record<string, number> = {};
        
        if (existingVote) {
          // Decrement previous vote
          logUpdate[`votes.${existingVote.vote}`] = -1;
        }

        // Increment new vote
        logUpdate[`votes.${vote}`] = 1;

        // Update vote record
        await votesCollection.updateOne(
          { logId, userId },
          { $set: { vote, createdAt: new Date() } },
          { upsert: true, session }
        );

        // Update log counts
        await logsCollection.updateOne(
          { _id: new ObjectId(logId) },
          { $inc: logUpdate },
          { session }
        );
      });

      result = { success: true };
    } finally {
      await session.endSession();
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId } = body as {
      logId: string;
      userId: string;
    };

    if (!logId || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "reclaim");
    const votesCollection = db.collection<VoteDoc>("votes");
    const logsCollection = db.collection("logs");

    const session = client.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        // Get existing vote
        const existingVote = await votesCollection.findOne(
          { logId, userId },
          { session }
        );

        if (existingVote) {
          // Decrement vote count
          await logsCollection.updateOne(
            { _id: new ObjectId(logId) },
            { $inc: { [`votes.${existingVote.vote}`]: -1 } },
            { session }
          );

          // Remove vote record
          await votesCollection.deleteOne(
            { logId, userId },
            { session }
          );
        }
      });

      result = { success: true };
    } finally {
      await session.endSession();
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
