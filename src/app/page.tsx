'use client';

import { useState } from "react";
import debounce from 'lodash.debounce';
import { shuntingYardCalculate } from "./shuntingYardCalculate";

const styles = {
  calculator: {
    display: 'inline-block',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
  },
  display: {
    background: '#f4f4f4',
    marginBottom: '10px',
    padding: '10px',
    fontSize: '24px',
  },
  buttons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '5px',
  },
  button: {
    background: 'lightgreen',
    color: 'darkgreen',
    border: 'none',
    padding: '20px',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default function Home() {
  const [input, setInput] = useState<string>('');

  const [LLMResult1, setLLMResult1] = useState<string>('0');
  const [LLMResult2, setLLMResult2] = useState<string>('0');
  const [SYResult, setSYResult] = useState<string>('0');

  const compute = debounce(async () => {
    const correctValue = shuntingYardCalculate(input || '0');

    setSYResult(isNaN(correctValue) ? 'ERR': correctValue.toString());


    console.log(input);

    const response1 = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, llm: 1 }),
    });
    // const response2 = await fetch('/api/calculate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ input, llm: 1 }),
    // });

    const data1 = await response1.json();
    setLLMResult1(data1);
  }, 100);


  const buttons = [
    '(', ')', 'C', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '+',
    '1', '2', '3', '-',
    '0', '=', '⌫'
  ]

  return <div style={styles.calculator}>
    <div style={styles.display}>
      <div>{input || '0'}</div>
      <div>{LLMResult1 !== '' && `= ${LLMResult1}`}</div>
      <div>{LLMResult2 !== '' && `= ${LLMResult2}`}</div>
      <div>{SYResult !== '' && `= ${SYResult}`}</div>
    </div>
    <div style={styles.buttons}>
    {buttons.map((value) => <button style={styles.button} key={value} onClick={() => {
      switch (value) {
        case '=':
          compute();
          break;
        case 'C':
          setInput('');
          break;
        case '⌫':
          setInput(curr => curr.substring(0, curr.length-1));
          break;
        default:
          setInput(curr => curr + value);
      }

    }}>
      {value}
    </button>)
    }</div>
  </div>
}
