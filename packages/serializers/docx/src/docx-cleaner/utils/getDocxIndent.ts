const DOCX_INDENT_STEP = 32;

export const getDocxIndent = (
  element: Element,
  indentStep = DOCX_INDENT_STEP
): number => {
  const el = element as HTMLElement;
  const { marginLeft } = el.style;

  const marginLeftNumber = parseInt(marginLeft.replace(/[^0-9]/g, ''), 10);

  if (!marginLeftNumber) return 0;

  return Math.round(marginLeftNumber / indentStep);
};
