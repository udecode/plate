import { EDescendant, Value } from '@udecode/slate';
import { jsx } from 'slate-hyperscript';

import { PlateEditor } from '../../../types/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement,
  stripWhitespace = true
): EDescendant<V>[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx(
      'fragment',
      {},
      deserializeHtmlNodeChildren(editor, element, stripWhitespace)
    ) as EDescendant<V>[];
  }
};
