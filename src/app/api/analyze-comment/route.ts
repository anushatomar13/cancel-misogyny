import { NextRequest, NextResponse } from "next/server";

function preprocessJson(jsonStr: string): string {
  return jsonStr.replace(/\\n/g, '\n');
}

function buildPrompt(comment: string) {
  return `
You are an AI expert in online hate. Analyze the following comment and:
1. Tell whether it's misogynistic (yes/no)
2. Explain why it's harmful
3. Suggest 2 short replies to call it out respectfully
4. Suggest relevant tags (e.g., mansplaining, objectification, stereotype)

Comment: "${comment}"

Respond in JSON with keys: sexism_score (0-1), explanation, counter_comments (array), tags (array).

DO NOT include extra backslashes or malformed syntax. Respond only in valid JSON format.
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body as { text: string };
    if (!text) {
      return NextResponse.json({ error: "Missing comment text" }, { status: 400 });
    }
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are an AI assistant that analyzes text for misogynistic content. You respond only in valid JSON format." },
          { role: "user", content: buildPrompt(text) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json({ error: "Groq API error", details: errorText }, { status: 500 });
    }
    const responseJson = await groqResponse.json();
    const contentText = responseJson?.choices?.[0]?.message?.content;
    if (!contentText) {
      return NextResponse.json({ error: "Invalid API response format" }, { status: 500 });
    }
    try {
      const preprocessedContent = preprocessJson(contentText);
      const aiResult = JSON.parse(preprocessedContent);
      return NextResponse.json(aiResult, { status: 200 });
    } catch (parseError) {
      try {
        if (typeof contentText === 'object') {
          return NextResponse.json(contentText, { status: 200 });
        }
        return NextResponse.json({
          error: "Failed to parse response",
          details: "JSON parsing error",
          raw_text: contentText
        }, { status: 500 });
      } catch (err) {
        return NextResponse.json({ error: "Server error processing response" }, { status: 500 });
      }
    }
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
