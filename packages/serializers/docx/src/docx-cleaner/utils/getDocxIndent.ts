const DOCX_INDENT_STEP = 36;

const extractNumber = (str: string) =>
  parseInt(str.replace(/[^\d.,]+/, ''), 10);

export const getDocxIndent = (
  element: Element,
  indentStep = DOCX_INDENT_STEP
): number => {
  const el = element as HTMLElement;
  const { marginLeft, textIndent } = el.style;

  const indent = extractNumber(marginLeft) || extractNumber(textIndent);

  if (!indent) return 0;

  return Math.round(indent / indentStep);
};
