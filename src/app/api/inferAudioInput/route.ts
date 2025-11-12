import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { userPrompt } from "./userPrompt";
import { logToDiscord } from "@/lib/server/logToDiscord";
import { models } from "@/lib/shared/models";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqTranscription(audioFilePath: File) {
  return groq.audio.transcriptions.create({
    file: audioFilePath,
    model: models[models['whisper-large-v3-turbo']],
    prompt: userPrompt,
    response_format: "json",
    temperature: 0.0,
  });
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audioFile') as File;

  const transcription = await getGroqTranscription(audioFile);

  await logToDiscord(req, transcription.text, audioFile);
  console.log(`LOG: ${transcription.text}`);

  return NextResponse.json(transcription.text, {
    status: 200
  });
};
