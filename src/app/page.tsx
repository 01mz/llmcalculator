'use client';

import { ChangeEvent, useRef, useState } from "react";
import debounce from 'lodash.debounce';
import { shuntingYardCalculate } from "./shuntingYardCalculate";
import styles from './page.module.css';
import { models } from "./utils/models";

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [imageInput, setImageInput] = useState<string>('');

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

  const inferImageText = debounce(async (imageFile: File) => {
    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("imageFile", imageFile, imageFile.name);

    setInput('...');
    try {
      const response = await fetch('api/inferImageText', {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log('Image inference result:', data);

      setInput(data);
      compute(data);

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
    const imageFile = e.target.files?.[0];
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      setImageInput(imageUrl);
      inferImageText(imageFile);
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

    canvas.toBlob((imageBlob) => {
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageInput(imageUrl);
        inferImageText(new File([imageBlob], "image", { type: "image/png" }));
      }
    });

  };

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const audioFile = e.target.files?.[0];
    if (audioFile) {
      const audioUrl = URL.createObjectURL(audioFile);
      setAudioUrl(audioUrl);
      inferAudioInput(audioFile);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Combine audio chunks into a single Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        inferAudioInput(new File([audioBlob], "recording", { type: "audio/wav" }));
        audioChunksRef.current = []; // Reset chunks for next recording
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getAudioTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const inferAudioInput = debounce(async (audioFile: File) => {
    if (!audioFile) return;

    const formData = new FormData();
    formData.append("audioFile", audioFile, audioFile.name);

    setInput('...');
    try {
      const response = await fetch('api/inferAudioInput', {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log('Audio inference result:', data);

      setInput(data);
      compute(data);

    } catch (error) {
      console.error("Error inferring audio:", error);
    }
  }, 100);

  return <div className={styles.app}>
    <details>
      <summary>🔊 Voice Input <span className={styles.label}>(whisper-large-v3-turbo)</span></summary>
      <div className={styles.audioInputContainer}>
        <div className={styles.label}>Capture voice:</div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "⏸ Stop Recording " : "▶ Start Recording"}
        </button>

        <div className={styles.label}>or upload audio file (max 25MB):</div>
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
        {audioUrl && (!isRecording ?
          <audio controls src={audioUrl} className={styles.audioPreview} /> : <p>recording...</p>)}
      </div>
    </details>

    <details>
      <summary>📸 Camera Input <span className={styles.label}>(llama-3.2-90b-vision-preview)</span></summary>
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

        <div className={styles.label}>or upload image (max 4MB):</div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageInput && <img src={imageInput} alt="Image Input Preview" className={styles.imagePreview} />}
      </div>
    </details>

    <div className={styles.calculator}>
      <div className={styles.display}>
        <div className={styles.label}>Input:</div>
        <div className={styles.inputDisplay}>{input || '0'}</div>
        <div className={styles.label}>{models[models["llama3-8b-8192"]]}:</div>
        <div>{`= ${LLMResult1}`}</div>
        <div className={styles.label}>{models[models["llama-3.1-70b-versatile"]]}:</div>
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

    <div>
      <div className={styles.hint}>Try 10+1010.</div>
      <div className={styles.hint}>Source code on <a href="https://github.com/01mz/llmcalculator" target="_blank" rel="noopener noreferrer">Github</a>.<br />
        Sample input <a href="https://github.com/01mz/llmcalculator/tree/main/sample_input/images" target="_blank" rel="noopener noreferrer">images</a> and <a href="https://github.com/01mz/llmcalculator/tree/main/sample_input/audio" target="_blank" rel="noopener noreferrer">audio</a>.</div>
    </div>
  </div>
}
