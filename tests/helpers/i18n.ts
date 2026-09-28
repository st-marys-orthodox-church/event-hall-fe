import chat from '../../public/locales/en/chat.json';
import viewing from '../../public/locales/en/viewing.json';

const NAMESPACES: Record<string, unknown> = { chat, viewing };

/** Stands in for next-i18next with the real English copy, so tests read like the page does. */
export const useTranslation = (namespace: string) => ({
  t: (key: string, options: Record<string, unknown> = {}) => {
    const value = key
      .split('.')
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        NAMESPACES[namespace]
      );
    if (options.returnObjects) return value;
    if (typeof value !== 'string') return key;
    return value.replace(/{{(\w+)}}/g, (_match, name: string) => String(options[name] ?? ''));
  },
});
