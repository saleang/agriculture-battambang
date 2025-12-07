import React from 'react';
import { Label } from '@/components/ui/label';

type InputLabelProps = React.ComponentProps<typeof Label> & { value?: string };

export default function InputLabel({ value, children, ...props }: InputLabelProps) {
    return <Label {...props}>{value || children}</Label>;
}
