import { WhiteSpaceRule } from './types';

export const inferWhiteSpaceRule = (
  element: HTMLElement
): WhiteSpaceRule | null => {
  const whiteSpaceProperty = element.style.whiteSpace;

  switch (whiteSpaceProperty) {
    case 'normal':
    case 'nowrap': {
      return 'normal';
    }
    case 'pre':
    case 'pre-wrap':
    case 'break-spaces': {
      return 'pre';
    }
    case 'pre-line': {
      return 'pre-line';
    }
  }

  if (element.tagName === 'PRE') {
    return 'actual-pre';
  }

  if (whiteSpaceProperty === 'initial') {
    return 'normal';
  }

  return null;
};
