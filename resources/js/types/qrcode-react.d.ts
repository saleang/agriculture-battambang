declare module 'qrcode.react' {
  import * as React from 'react';

  export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

  export interface QRCodeProps {
    value: string;
    size?: number;
    level?: ErrorCorrectionLevel;
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
  }

  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
}
