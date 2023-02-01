import { ReactNode } from 'react';

type INumberDisplayProps = {
  text: string;
  value: string | number;
  icon?: ReactNode;
};

export const NumberDisplay = ({ text, value, icon }: INumberDisplayProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      {icon && icon}
      <span className="text-neutral-500">{text}</span>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  );
};
