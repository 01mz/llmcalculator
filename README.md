# LLMCalculator

Calculator powered by LLM.

![example: 1+1](./images/example1.png)
![example: 10+1010](./images/example1010.png)

## Architecture
Next.js app hosted on Vercel, calls Groq API to query Llama models.

![architecture](./images/architecture.png)

## Local development
Create `.env.local` file and specify a `GROQ_API_KEY`.

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
