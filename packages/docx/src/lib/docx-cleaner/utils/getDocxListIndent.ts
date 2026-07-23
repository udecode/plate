import { getDocxIndent } from './getDocxIndent';

const LEVEL_PATTERN = /level(\d+)/i;

export const getDocxListIndent = (element: Element): number => {
  const styleAttribute = element.getAttribute('style') || '';
  const matches = LEVEL_PATTERN.exec(styleAttribute);
  const visualIndent =
    'style' in element ? getDocxIndent(element as HTMLElement) : 0;

  if (matches && matches.length > 0) {
    const [, level] = matches;

    return Math.max(Number.parseInt(level, 10), visualIndent);
  }

  return Math.max(1, visualIndent);
};
