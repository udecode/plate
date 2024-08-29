export const getTextListStyleType = (text: string): string | undefined => {
  text = text.trimStart();

  if (text.match(/^\d+[.\\]/)?.[0]) {
    if (text.startsWith('0')) {
      return 'decimal-leading-zero';
    }

    return 'decimal';
  }
  if (text.match(/^[cdilmvx]+\./)?.[0]) {
    return 'lower-roman';
  }
  if (text.match(/^[a-z]+\./)?.[0]) {
    return 'lower-alpha';
  }
  if (text.match(/^[CDILMVX]+\./)?.[0]) {
    return 'upper-roman';
  }
  if (text.match(/^[A-Z]+\./)?.[0]) {
    return 'upper-alpha';
  }
};
