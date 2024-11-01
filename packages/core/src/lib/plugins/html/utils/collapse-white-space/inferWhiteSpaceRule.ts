import type { WhiteSpaceRule } from './types';

export const inferWhiteSpaceRule = (
  element: HTMLElement
): WhiteSpaceRule | null => {
  const whiteSpaceProperty = element.style.whiteSpace;

  switch (whiteSpaceProperty) {
    case 'break-spaces':
    case 'pre':
    case 'pre-wrap': {
      return 'pre';
    }
    case 'normal':
    case 'nowrap': {
      return 'normal';
    }
    case 'pre-line': {
      return 'pre-line';
    }
  }

  if (element.tagName === 'PRE') {
    return 'pre';
  }
  if (whiteSpaceProperty === 'initial') {
    return 'normal';
  }

  return null;
};
