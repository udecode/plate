import { TDescendant } from '@udecode/plate-core';
import { jsx } from 'slate-hyperscript';
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
