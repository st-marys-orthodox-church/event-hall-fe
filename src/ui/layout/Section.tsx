import type { ReactNode } from 'react';

type ISectionProps = {
  title?: string;
  titleAs?: 'h1' | 'h2';
  titleClassName?: string;
  description?: string;
  yPadding?: string;
  children: ReactNode;
  className?: string;
};

const Section = (props: ISectionProps) => {
  const Heading = props.titleAs ?? 'h2';
  return (
    <div
      className={`max-w-screen-xl mx-auto px-3 ${props.className || ''} ${
        props.yPadding ? props.yPadding : 'py-8'
      }`}
    >
      {(props.title || props.description) && (
        <div className="mb-12 text-center">
          {props.title && (
            <Heading
              className={`font-display text-stone-900 leading-tight ${
                props.titleClassName ?? 'text-4xl md:text-5xl'
              }`}
            >
              {props.title}
            </Heading>
          )}
          {props.title && <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />}
          {props.description && (
            <p className="mt-5 text-lg text-stone-600 md:px-20 leading-relaxed">
              {props.description}
            </p>
          )}
        </div>
      )}

      {props.children}
    </div>
  );
};

export { Section };
