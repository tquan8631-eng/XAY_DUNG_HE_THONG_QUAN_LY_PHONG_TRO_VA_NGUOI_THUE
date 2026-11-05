import React from 'react';

interface BadgeProps {
  text: string;
  color?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color = 'bg-gray-100 text-gray-800' }) => {
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${color}`}>
      {text}
    </span>
  );
};

export default Badge;
