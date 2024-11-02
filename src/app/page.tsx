'use client';

import { useState } from "react";
import debounce from 'lodash.debounce';
import { shuntingYardCalculate } from "@/lib/client/shuntingYardCalculate";
import styles from './page.module.css';
import { models } from "@/lib/shared/models";
import VoiceInput from "./components/VoiceInput";
import ImageInput from "./components/ImageInput";
import ButtonsInput from "./components/ButtonsInput";
import OverflowText from "./components/OverflowText";

export default function Home() {
  const [input, setInput] = useState<string>('');

  const [LLMResult1, setLLMResult1] = useState<string>('0');
  const [LLMResult2, setLLMResult2] = useState<string>('0');
  const [SYResult, setSYResult] = useState<string>('0');

  const LLMcalculate = async (input: string, llm: number) => {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, llm }),
    });

    return await response.json();
  }

  const compute = debounce(async (input) => {
    const correctValue = shuntingYardCalculate(input || '0');
    setSYResult(isNaN(correctValue) ? 'ERR' : correctValue.toString());

    setLLMResult1('...');
    setLLMResult2('...');
    LLMcalculate(input, models["llama3-8b-8192"])
      .then((res) => {
        setLLMResult1(res)
      });

    LLMcalculate(input, models["llama-3.1-70b-versatile"])
      .then((res) => {
        setLLMResult2(res)
      });

  }, 100);

  return <div className={styles.app}>
    <VoiceInput setInput={setInput} compute={compute} />
    <ImageInput setInput={setInput} compute={compute} />

    <div className={styles.display}>
      <div className={styles.label}>Input:</div>
      <OverflowText className={styles.inputDisplay} text={input || '0'} />

      <div className={styles.label}>{models[models["llama3-8b-8192"]]}:</div>
      <OverflowText text={`= ${LLMResult1}`} />
      <div className={styles.label}>{models[models["llama-3.1-70b-versatile"]]}:</div>
      <OverflowText text={`= ${LLMResult2}`} />
      <div className={styles.label}>Shunting Yard Algorithm:</div>
      <OverflowText text={`= ${SYResult}`} />
    </div>
    <ButtonsInput input={input} setInput={setInput} compute={compute} />

    <footer>
      <div className={styles.hint}>Try 10+1010.</div>
      <div className={styles.hint}>Source code on <a href="https://github.com/01mz/llmcalculator" target="_blank" rel="noopener noreferrer">Github</a>.<br />
        Sample input <a href="https://github.com/01mz/llmcalculator/tree/main/sample_input/images" target="_blank" rel="noopener noreferrer">images</a> and <a href="https://github.com/01mz/llmcalculator/tree/main/sample_input/audio" target="_blank" rel="noopener noreferrer">audio</a>.</div>
    </footer>
  </div>
}
