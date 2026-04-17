import type { ReactNode } from 'react';

type INumberDisplayProps = {
  text: string;
  value: string | number;
  icon?: ReactNode;
};

export const NumberDisplay = ({ text, value, icon }: INumberDisplayProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center py-8 px-4">
      {icon && <div className="mb-4 opacity-80">{icon}</div>}
      <span className="font-display text-5xl md:text-6xl text-stone-900 font-medium leading-none">
        {value}
      </span>
      <span className="eyebrow text-stone-500 mt-3">{text}</span>
    </div>
  );
};
