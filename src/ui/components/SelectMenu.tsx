import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

type ISelectOption<T extends string> = {
  value: T;
  label: string;
};

type ISelectMenuProps<T extends string> = {
  label: string;
  value: T;
  options: ISelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export const SelectMenu = <T extends string>(props: ISelectMenuProps<T>) => {
  const { label, value, options, onChange, className = '' } = props;
  const id = useId();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value)
    )
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openMenu = () => {
    setHighlighted(
      Math.max(
        0,
        options.findIndex((option) => option.value === value)
      )
    );
    setOpen(true);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === ' ') {
      event.preventDefault();
      openMenu();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlighted((index) => Math.min(options.length - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlighted((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setHighlighted(0);
        break;
      case 'End':
        event.preventDefault();
        setHighlighted(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(highlighted);
        break;
      case 'Escape':
      case 'Tab':
        setOpen(false);
        buttonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span id={`${id}-label`} className="eyebrow block mb-2 text-stone-500">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-controls={open ? `${id}-listbox` : undefined}
        className={`eyebrow w-full flex items-center justify-between gap-3 bg-white border text-stone-800 px-4 py-3.5 text-left transition-colors duration-300 ease-refined focus:outline-none focus-visible:border-brand-green ${
          open ? 'border-brand-green' : 'border-stone-300'
        }`}
      >
        <span id={`${id}-value`}>{selected?.label}</span>
        <ExpandMoreIcon
          fontSize="small"
          className={`shrink-0 text-stone-500 transition-transform duration-300 ease-refined ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {/* A custom listbox on purpose: the native picker looks off-brand on phones. */}
      <div
        ref={listRef}
        id={`${id}-listbox`}
        // biome-ignore lint/a11y/useSemanticElements: styled listbox with full keyboard support
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-option-${options[highlighted]?.value}` : undefined}
        onKeyDown={handleListKeyDown}
        className={`absolute left-0 right-0 top-full z-20 mt-1 bg-white border border-stone-200 shadow-soft outline-none origin-top transition-[opacity,transform] duration-200 ease-refined ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isHighlighted = index === highlighted;
          return (
            <div
              key={option.value}
              id={`${id}-option-${option.value}`}
              // biome-ignore lint/a11y/useSemanticElements: option inside the custom listbox
              role="option"
              tabIndex={-1}
              aria-selected={isSelected}
              onPointerMove={() => setHighlighted(index)}
              onClick={() => commit(index)}
              className={`eyebrow flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors duration-200 ease-refined ${
                isSelected ? 'text-brand-green-ink' : 'text-stone-600'
              } ${isHighlighted ? 'bg-stone-50 text-stone-900' : ''}`}
            >
              {option.label}
              {isSelected && <span className="w-5 h-px bg-brand-gold" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
