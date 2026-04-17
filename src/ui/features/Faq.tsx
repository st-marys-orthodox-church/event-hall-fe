import { useEffect, useRef, useState } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqProps = {
  items: FaqItem[];
};

const FaqRow = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    setHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <AnimationOnScroll animateIn="animate__fadeInUp" delay={index * 80} animateOnce>
      <div className="border-b border-stone-200/80">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-6 py-6 text-left group"
        >
          <span
            className={`font-display text-xl md:text-2xl transition-colors duration-500 ease-refined ${
              isOpen ? 'text-[#7c9885]' : 'text-stone-900 group-hover:text-[#7c9885]'
            }`}
          >
            {item.question}
          </span>
          <span
            aria-hidden
            className={`relative flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-500 ease-refined ${
              isOpen
                ? 'rotate-45 text-[#c9a86c]'
                : 'rotate-0 text-stone-400 group-hover:text-[#c9a86c]'
            }`}
          >
            <span className="absolute w-5 h-px bg-current" />
            <span className="absolute h-5 w-px bg-current" />
          </span>
        </button>
        <div
          style={{
            height,
            transition: 'height 520ms cubic-bezier(0.22, 1, 0.36, 1)',
            overflow: 'hidden',
          }}
        >
          <div ref={contentRef}>
            <p
              className={`text-stone-600 leading-relaxed pb-6 pr-10 transition-opacity duration-500 ease-refined ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </AnimationOnScroll>
  );
};

export const Faq = ({ items }: FaqProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-stone-200/80">
      {items.map((item, idx) => (
        <FaqRow
          key={item.question}
          item={item}
          index={idx}
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        />
      ))}
    </div>
  );
};
