import type { ReactNode } from 'react';

interface Props {
  html: string;
  className?: string;
}

export default function TypographyWrapper({ html, className = '' }: Props) {
  return (
    <div className={`prose prose-lg font-karla font-light max-w-none ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
} 