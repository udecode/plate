import type { TDescendant } from '@udecode/slate';

import { jsx } from 'slate-hyperscript';

import type { PlateEditor } from '../../../editor';

import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/** Deserialize HTML body element to Fragment. */
export const htmlBodyToFragment = (
  editor: PlateEditor,
  element: HTMLElement
): TDescendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx(
      'fragment',
      {},
      deserializeHtmlNodeChildren(editor, element)
    ) as TDescendant[];
  }
};
