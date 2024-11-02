import { useEffect, useRef, useState } from "react";
import styles from '../page.module.css';

const OverflowText = ({ text, className }: { text: string, className?: string }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                setIsDialogOpen(false);
            }
        };

        if (isDialogOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDialogOpen]);

    return (
        <div className={className}>
            <div className={styles.overflowTextContainer} onClick={() => setIsDialogOpen(true)}>
                {text}
            </div>

            {isDialogOpen && (
                <dialog open className={styles.overflowTextDialog} ref={dialogRef}>
                    {text}
                </dialog>
            )}
        </div>
    );
};

export default OverflowText;
