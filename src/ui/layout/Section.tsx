import { ReactNode } from 'react';

type ISectionProps = {
  title?: string;
  description?: string;
  yPadding?: string;
  children: ReactNode;
  className?: string;
};

const Section = (props: ISectionProps) => (
  <div
    className={`max-w-screen-lg mx-auto px-3 ${props.className || ''} ${
      props.yPadding ? props.yPadding : 'py-8'
    }`}
  >
    {(props.title || props.description) && (
      <div className="mb-12 text-center">
        {props.title && (
          <h2 className="text-3xl text-gray-900 font-bold">{props.title}</h2>
        )}
        {props.description && (
          <div className="mt-4 text-lg md:px-20">{props.description}</div>
        )}
      </div>
    )}

    {props.children}
  </div>
);

export { Section };
