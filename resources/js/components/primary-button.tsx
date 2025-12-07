import { Button } from '@/components/ui/button';
import { type ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            disabled={disabled}
            className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
        >
            {children}
        </Button>
    );
}
