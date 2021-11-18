import { jsx } from 'slate-hyperscript';
import { TDescendant } from '../../../types/slate/TDescendant';
import { DeserializeHtmlChildren } from '../types';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = ({
  element,
  children,
}: {
  element: HTMLElement;
  children: DeserializeHtmlChildren[];
}): TDescendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
};
