import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { systemPrompt } from "./systemPrompt";
import { models } from "@/app/utils/models";
import { logToDiscord } from "@/app/utils/logToDiscord";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(input: string, llm: number) {
  return groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: input,
      },
    ],
    model: models[llm],
    temperature: 0,
  });
};

export async function POST(req: Request) {
  const { input, llm } = await req.json();
  console.log("LOG:", input, llm);

  const chatCompletion = await getGroqChatCompletion(input, llm);
  const firstResult = chatCompletion.choices[0]?.message?.content || "";
  logToDiscord(req, `${input};${llm};${firstResult}`);

  return NextResponse.json(firstResult, {
    status: 200
  });
};