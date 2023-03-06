import { EDescendant, Value } from '@udecode/slate';
import { jsx } from 'slate-hyperscript';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
): EDescendant<V>[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx(
      'fragment',
      {},
      deserializeHtmlNodeChildren(editor, element)
    ) as EDescendant<V>[];
  }
};
