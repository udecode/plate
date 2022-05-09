import { jsx } from 'slate-hyperscript';
import { EDescendant } from '../../../slate/node/TDescendant';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';

jsx;

/**
 * Deserialize HTML body element to Fragment.
 */
export const htmlBodyToFragment = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
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
