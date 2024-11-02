import React, { ChangeEvent, useRef, useState } from 'react'
import styles from '../page.module.css';
import debounce from 'lodash.debounce';

type ImageInputProps = {
    setInput: React.Dispatch<React.SetStateAction<string>>,
    compute: (input: string) => void,
};

export default function ImageInput({ setInput, compute }: ImageInputProps) {
    const [imageInput, setImageInput] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

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

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const imageFile = e.target.files?.[0];
        if (imageFile) {
            const imageUrl = URL.createObjectURL(imageFile);
            setImageInput(imageUrl);
            inferImageText(imageFile);
        }
    };

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

    return <details>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {imageInput && <img src={imageInput} alt="Image Input Preview" className={styles.imagePreview} />}
        </div>
    </details>;
};
