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

export const getDocxIndent = (element: Element): number => {
  const el = element as HTMLElement;
  const { marginLeft, textIndent } = el.style;

  let indent = styleToIndent(marginLeft);
  if (indent) return indent;

  indent = styleToIndent(textIndent);
  if (indent) return indent;

  return 0;
};
