import { type InputHTMLAttributes, useEffect, useRef } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
}

export default function TextInput({
    className = '',
    isFocused = false,
    ...props
}: TextInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            ref={inputRef}
            className={`border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${className}`}
        />
    );
}
