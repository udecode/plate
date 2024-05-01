import { collapseWhiteSpaceElement } from './collapseWhiteSpaceElement';
import { CollapseWhiteSpaceState } from './types';

// Entrypoint
export const collapseWhiteSpace = (element: HTMLElement) => {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Mutable state object
  const state: CollapseWhiteSpaceState = {
    inlineFormattingContext: null,
    whiteSpaceRule: 'normal',
  };

  collapseWhiteSpaceElement(clonedElement, state);

  return clonedElement;
};
