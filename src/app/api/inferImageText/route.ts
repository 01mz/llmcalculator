import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { userPrompt } from "./userPrompt";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(imageUrl: string) {
  return groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": userPrompt,
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrl,
            }
          }
        ]
      },
      {
        "role": "assistant",
        "content": ""
      }
    ],
    "model": "llama-3.2-90b-vision-preview",
    "temperature": 0,
    "max_tokens": 1024,
    "top_p": 1,
    "stream": false,
    "stop": null
  });
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get('imageFile') as File;
  const base64 = Buffer.from(await imageFile.arrayBuffer()).toString('base64')

  const imageUrl = `data:${imageFile.type};base64,${base64}`;

  const chatCompletion = await getGroqChatCompletion(imageUrl);
  const firstResult = chatCompletion.choices[0]?.message?.content || ""

  console.log('LOG: ' + firstResult);

  return NextResponse.json(firstResult, {
    status: 200
  });
};