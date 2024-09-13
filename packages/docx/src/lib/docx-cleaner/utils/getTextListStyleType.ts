export const getTextListStyleType = (text: string): string | undefined => {
  text = text.trimStart();

  if (/^\d+[.\\]/.exec(text)?.[0]) {
    if (text.startsWith('0')) {
      return 'decimal-leading-zero';
    }

    return 'decimal';
  }
  if (/^[cdilmvx]+\./.exec(text)?.[0]) {
    return 'lower-roman';
  }
  if (/^[a-z]+\./.exec(text)?.[0]) {
    return 'lower-alpha';
  }
  if (/^[CDILMVX]+\./.exec(text)?.[0]) {
    return 'upper-roman';
  }
  if (/^[A-Z]+\./.exec(text)?.[0]) {
    return 'upper-alpha';
  }
};
