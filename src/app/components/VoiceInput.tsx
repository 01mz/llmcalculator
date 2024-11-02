import React, { ChangeEvent, useRef, useState } from 'react'
import styles from '../page.module.css';
import debounce from 'lodash.debounce';

type VoiceInputProps = {
    setInput: React.Dispatch<React.SetStateAction<string>>,
    compute: (input: string) => void,
};

export default function VoiceInput({ setInput, compute }: VoiceInputProps) {
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

    return <details>
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
    </details>;
};
