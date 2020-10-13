import { Descendant } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

/**
 * Deserialize HTML body element to Fragment.
 */
export const deserializeHTMLToFragment = ({
  element,
  children,
}: {
  element: HTMLElement;
  children: DeserializeHTMLChildren[];
}): Descendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
};
