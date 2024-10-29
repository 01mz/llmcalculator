'use client';

import { ChangeEvent, useRef, useState } from "react";
import debounce from 'lodash.debounce';
import { shuntingYardCalculate } from "./shuntingYardCalculate";
import styles from './page.module.css';
import { sanitizeInput } from "./utils/sanitizeInput";

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [detectedInput, setDetectedInput] = useState<string>('');
  const [imageInput, setImageInput] = useState<string>('');

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

  const compute = debounce(async (input) => {
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

  const inferImageText = debounce(async (imageUrl: string) => {
    if (!imageUrl) {
      return;
    }

    setDetectedInput('...');
    setInput('...');
    try {
      const response = await fetch('api/inferImageText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      console.log('Image inference result:', data);
      setDetectedInput(data);

      const sanitizedInput = sanitizeInput(data);
      setInput(sanitizedInput);
      compute(sanitizedInput);

    } catch (error) {
      console.error('Error infering image text:', error);
    }
  }, 100);

  const buttons = [
    '(', ')', 'C', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '+',
    '1', '2', '3', '-',
    '0', '=', '⌫'
  ]

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      // Convert image file to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImageInput(imageUrl as string);
        inferImageText(imageUrl as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error accessing the camera: ", error);
    }
  };
  const stopCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    const imageUrl = canvas.toDataURL("image/png");
    setImageInput(imageUrl);
    inferImageText(imageUrl);

  };

  return <div className={styles.app}>
    <details>
      <summary>📸 Image Input</summary>
      <div className={styles.imageInputContainer}>
        <div className={styles.label}>Capture image:</div>
        <div>
          <video ref={videoRef} className={styles.videoPreview} />
          <div>
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={capturePhoto}>Capture Photo</button>
            <button onClick={stopCamera}>Stop Camera</button>
          </div>
        </div>

        <div className={styles.label}>or upload image:</div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageInput && <img src={imageInput} alt="Image Input Preview" className={styles.imagePreview} />}
      </div>
    </details>

    <div className={styles.calculator}>
      <div className={styles.display}>
        <div className={styles.label}>Detected Input:</div>
        <div className={styles.inputDisplay}>{detectedInput || '0'}</div>
        <div className={styles.label}>Sanitized Input:</div>
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
              compute(input);
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
    </div>

    <div className={styles.hintContainer}>
      <div className={styles.hint}>Try 10+1010.</div>
      <div className={styles.hint}>Source code on <a href="https://github.com/01mz/llmcalculator" target="_blank" rel="noopener noreferrer">Github</a>.<br />
        Sample input <a href="https://github.com/01mz/llmcalculator/tree/main/sample_input/images" target="_blank" rel="noopener noreferrer">images</a>.</div>
    </div>
  </div>
}
