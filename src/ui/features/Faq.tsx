import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { EASING, TIMING } from '../../utils/DesignTokens';

type FaqItem = {
  question: string;
  answer: string;
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
    <AnimationOnScroll
      animateIn="animate__fadeInUp"
      delay={index * TIMING.faqStaggerMs}
      animateOnce
    >
      <div className="border-b border-stone-200/80">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-6 py-6 text-left group"
        >
          <span
            className={`text-base md:text-lg font-medium tracking-tight transition-colors duration-500 ease-refined ${
              isOpen ? 'text-brand-green' : 'text-stone-900 group-hover:text-brand-green'
            }`}
          >
            {item.question}
          </span>
          <span
            aria-hidden
            className={`relative flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-500 ease-refined ${
              isOpen
                ? 'rotate-45 text-brand-gold'
                : 'rotate-0 text-stone-400 group-hover:text-brand-gold'
            }`}
          >
            <span className="absolute w-4 h-px bg-current" />
            <span className="absolute h-4 w-px bg-current" />
          </span>
        </button>
        <div
          style={{
            height,
            transition: `height 520ms ${EASING.refined}`,
            overflow: 'hidden',
          }}
        >
          <div ref={contentRef}>
            <p
              className={`text-stone-600 text-base leading-relaxed pb-6 pr-10 transition-opacity duration-500 ease-refined ${
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

type FaqProps = {
  ns?: string;
  itemsKey?: string;
};

export const Faq = ({ ns = 'home', itemsKey = 'faq.items' }: FaqProps = {}) => {
  const { t } = useTranslation(ns);
  const items = (t(itemsKey, { returnObjects: true }) as FaqItem[]) || [];
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
