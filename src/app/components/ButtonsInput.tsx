import styles from '../page.module.css';

type ButtonsInputProps = {
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    compute: (input: string) => void,
};

export default function ButtonsInput({ input, setInput, compute }: ButtonsInputProps) {
    const buttons = [
        '(', ')', 'C', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '+',
        '1', '2', '3', '-',
        '0', '=', '⌫'
    ];

    return <div className={styles.buttons}>
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
        }
    </div>;
};
