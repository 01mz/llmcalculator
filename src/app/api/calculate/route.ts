import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { systemPrompt } from "./systemPrompt";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(input: string, llm: number) {
    return groq.chat.completions.create({
      messages: [
        {role: 'system',
        content: systemPrompt,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      model: llm === 1 ? 'llama3-8b-8192' : 'llama-3.1-70b-versatile',
    });
  }

// To handle a POST request to /api/calculate
export async function POST(req: Request) {
    const { input, llm } = await req.json();
    console.log(input, llm);

    const chatCompletion = await getGroqChatCompletion(input, llm);
    // Print the completion returned by the LLM.
    const firstResult = chatCompletion.choices[0]?.message?.content || ""
    console.log(chatCompletion);

    return NextResponse.json(firstResult, {
        status: 200
    });
}