import { Descendant } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

/**
 * Deserialize HTML body element to Fragment.
 */
export const deserializeHTMLToFragment = ({
  el,
  children,
}: {
  el: HTMLElement;
  children: DeserializeHTMLChildren[];
}): Descendant[] | undefined => {
  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
};
