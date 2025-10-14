import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg p-6 ${
        hover ? 'hover:border-gray-700 transition-colors cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

