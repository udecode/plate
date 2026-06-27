import { getSelectedDomNode } from './getSelectedDomNode';

/** Check if the DOM selection is outside the editor */
export const isSelectOutside = (html?: HTMLElement): boolean => {
  const domNodes = html ?? getSelectedDomNode();

  if (!domNodes) return false;

  const selectOutside = !!domNodes?.querySelector('[data-plite-editor="true"]');

  return selectOutside;
};
