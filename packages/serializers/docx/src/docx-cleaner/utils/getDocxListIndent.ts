export const getDocxListIndent = (element: Element): number => {
  const styleAttribute = element.getAttribute('style') || '';
  const matches = styleAttribute.match(/level(\d+)/im);

  if (matches && matches.length >= 1) {
    const [, level] = matches;
    return parseInt(level, 10);
  }

  return 1;
};
