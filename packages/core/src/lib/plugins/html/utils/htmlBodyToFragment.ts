import type { Descendant } from '@udecode/slate';

import { jsx } from 'slate-hyperscript';

import type { SlateEditor } from '../../../editor';

import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/** Deserialize HTML body element to Fragment. */
export const htmlBodyToFragment = (
  editor: SlateEditor,
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
