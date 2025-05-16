import { MongoClient } from "mongodb";
import fetch from "node-fetch";
import amqp, { ConsumeMessage } from "amqplib";

type AnalysisResponse = {
  sexism_score: number;
  explanation: string;
  counter_comments: string[];
  tags: string[];
};

type LogDoc = {
  text: string;
  explanation: string;
  ai_analysis: {
    sexism_score: number;
    counter_comments: string[];
    tags: string[];
  };
  tags: string[];
  votes: { sexist: number; notSexist: number };
  createdAt: Date;
  userId: string;
};

async function processMessage(content: string) {
  try {
    const data = JSON.parse(content);
    const commentText: string = data.text;
    const userId: string = data.userId;

    if (!commentText || !userId) {
      console.error("Missing required fields: text or userId");
      return;
    }

    const prompt = `
You are an AI expert in online hate. Analyze the following comment and:
1. Tell whether it's misogynistic (yes/no)
2. Explain why it's harmful
3. Suggest 2 short replies to call it out respectfully
4. Suggest relevant tags (e.g., mansplaining, objectification, stereotype)

Comment: "${commentText}"

Respond in JSON with keys: sexism_score (0-1), explanation, counter_comments (array), tags (array).
`;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system", 
            content: "You are an AI assistant that analyzes text for misogynistic content. You respond only in JSON format."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

    const responseJson = await response.json();
    const aiText = responseJson.choices[0].message.content;
    const aiResult: AnalysisResponse = JSON.parse(aiText);

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const logDoc: LogDoc = {
      text: commentText,
      explanation: aiResult.explanation,
      ai_analysis: {
        sexism_score: aiResult.sexism_score,
        counter_comments: aiResult.counter_comments,
        tags: aiResult.tags,
      },
      tags: aiResult.tags,
      votes: { sexist: 0, notSexist: 0 },
      createdAt: new Date(),
      userId: userId
    };

    await client.db(process.env.MONGODB_DB || "reclaim")
                .collection("logs")
                .insertOne(logDoc);

    await client.close();
    console.log(`Successfully saved analysis for user ${userId}`);

  } catch (err) {
    console.error("Error processing message:", err);
  }
}

async function startWorker() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await connection.createChannel();
  const queue = "groq-inference";
  
  await channel.assertQueue(queue, { durable: true });
  console.log("Worker listening for messages...");

  channel.consume(queue, async (msg: ConsumeMessage | null) => {
    if (msg) {
      try {
        await processMessage(msg.content.toString());
        channel.ack(msg);
      } catch (err) {
        console.error("Message processing failed:", err);
        channel.nack(msg);
      }
    }
  });
}

startWorker().catch(console.error);
