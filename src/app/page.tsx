'use client';

import { useState } from "react";
import debounce from 'lodash.debounce';
import { shuntingYardCalculate } from "./shuntingYardCalculate";
import styles from './page.module.css';

export default function Home() {
  const [input, setInput] = useState<string>('');

  const [LLMResult1, setLLMResult1] = useState<string>('0');
  const [LLMResult2, setLLMResult2] = useState<string>('0');
  const [SYResult, setSYResult] = useState<string>('0');


  const models = {
    'llama3-8b-8192': 0,
    'llama-3.1-70b-versatile': 1,
  }

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

  const compute = debounce(async () => {
    const correctValue = shuntingYardCalculate(input || '0');
    setSYResult(isNaN(correctValue) ? 'ERR' : correctValue.toString());


    setLLMResult1('...');
    setLLMResult2('...');
    LLMcalculate(input, models['llama3-8b-8192'])
      .then((res) => {
        setLLMResult1(res)
      });

    LLMcalculate(input, models['llama-3.1-70b-versatile'])
      .then((res) => {
        setLLMResult2(res)
      });

  }, 100);


  const buttons = [
    '(', ')', 'C', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '+',
    '1', '2', '3', '-',
    '0', '=', '⌫'
  ]

  return <div className={styles.calculator}>
    <div className={styles.display}>
      <div className={styles.inputDisplay}>{input || '0'}</div>
      <div className={styles.label}>{Object.keys(models)[0]}:</div>
      <div>{`= ${LLMResult1}`}</div>
      <div className={styles.label}>{Object.keys(models)[1]}:</div>
      <div>{`= ${LLMResult2}`}</div>
      <div className={styles.label}>Shunting Yard Algorithm:</div>
      <div>{`= ${SYResult}`}</div>
    </div>
    <div className={styles.buttons}>
      {buttons.map((value) => <button className={styles.button} key={value} onClick={() => {
        switch (value) {
          case '=':
            compute();
            break;
          case 'C':
            setInput('');
            break;
          case '⌫':
            setInput(curr => curr.substring(0, curr.length - 1));
            break;
          default:
            setInput(curr => curr + value);
        }

      }}>
        {value}
      </button>)
      }</div>
    <div className={styles.hint}>Try 10+1010.</div>
    <div className={styles.hint}>Source code on <a href="https://github.com/01mz/llmcalculator" target="_blank" rel="noopener noreferrer">Github</a>.</div>
  </div>
}
