import type { Descendant } from '@platejs/plite';

import { jsx } from '@platejs/plite-hyperscript';

import type { BaseEditor } from '../../../editor';

import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

/** Deserialize HTML body element to Fragment. */
export const htmlBodyToFragment = (
  editor: BaseEditor,
  element: HTMLElement
): Descendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx(
      'fragment',
      {},
      deserializeHtmlNodeChildren(editor, element)
    ) as Descendant[];
  }
};
