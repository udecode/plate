import { TDescendant } from '@udecode/plate-core';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const deserializeHTMLToFragment = ({
  element,
  children,
}: {
  element: HTMLElement;
  children: DeserializeHTMLChildren[];
}): TDescendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
};
