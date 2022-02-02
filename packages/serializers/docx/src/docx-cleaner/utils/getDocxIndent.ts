const DOCX_INDENT_STEP = 36;

const extractNumber = (str: string) => {
  let number = str.replace(/[^\d.,]+/, '');
  if (number[0] === '.') {
    number = `0${number}`;
  }
  return parseFloat(number);
};

const styleToIndent = (style: string, indentStep = DOCX_INDENT_STEP) => {
  const indent = extractNumber(style);
  if (indent) {
    if (style.includes('in')) {
      return Math.round((indent * 72) / indentStep);
    }
    return Math.round(indent / indentStep);
  }
  return 0;
};

export const getDocxSpacing = (element: Element, cssProp: string): number => {
  const el = element as HTMLElement;
  const spacing = el.style[cssProp];

  if (!spacing) return 0;

  return styleToIndent(spacing) || 0;
};

export const getDocxIndent = (element: Element) =>
  getDocxSpacing(element, 'marginLeft');

export const getDocxTextIndent = (element: Element) =>
  getDocxSpacing(element, 'textIndent');
