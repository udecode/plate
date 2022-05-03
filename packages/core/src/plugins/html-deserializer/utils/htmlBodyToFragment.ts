import { jsx } from 'slate-hyperscript';
import { TDescendant } from '../../../slate/types/TDescendant';
import { Value } from '../../../slate/types/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
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
