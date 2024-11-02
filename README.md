# LLMCalculator

Calculator powered by LLMs.

<img src="./images/example1.png" width="300">
<img src="./images/example1010.png" width="300">

### Audio Input
<img src="./images/audio_example.png" width="300">

### Image Input
<img src="./images/image_example.png" width="300">

## Architecture
No credit card tech stack:
- Next.js app deployed on Vercel (free tier)
- Groq to query LLM models (free tier limits 15-30 requests/min depending on model) 
- Discord for logging

![architecture](./images/architecture.png)

## Local development
Create a `.env.local` file with the following:
```
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
DISCORD_CHANNEL_ID=<YOUR_DISCORD_CHANNEL_ID>
DISCORD_BOT_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
```

Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Todos
- Engineer better prompts, adjust model parameters, sanitize inputs 
- To improve calculator accuracy could look into Groq [tool use](https://console.groq.com/docs/tool-use) to get the LLM to call a calculation function
- Look into Wolfram Alpha API?
- Try OpenAI models (likely better models available, but no free tier and some models are expensive)