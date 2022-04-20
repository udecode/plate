import { jsx } from 'slate-hyperscript';
import { PlateEditor } from '../../../types/PlateEditor';
import { TDescendant } from '../../../types/slate/TDescendant';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = <T = {}>(
  editor: PlateEditor<T>,
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
