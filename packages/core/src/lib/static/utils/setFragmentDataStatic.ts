import type { Descendant } from '@platejs/slate';

import type { SlateEditor } from '../../editor';

import { getPlainText } from '../internal/getPlainText';
import {
  getSelectedDomBlocks,
  getSelectedDomNode,
} from './getSelectedDomBlocks';

export const setFragmentDataStatic = (
  editor: SlateEditor,
  data: Pick<DataTransfer, 'getData' | 'setData'>
): boolean => {
  const domBlocks = getSelectedDomBlocks();

  // only crossing multiple blocks
  if (domBlocks && domBlocks.length > 0) {
    const fragment: Descendant[] = [];

    Array.from(domBlocks).forEach((node: any) => {
      const blockId = node.dataset.slateId;
      const block = editor.api.node({ id: blockId, at: [] });

      // prevent inline elements like link and table cells.
      if (block && block[1].length === 1) {
        fragment.push(block[0]);
      }
    });

    const string = JSON.stringify(fragment);
    const encoded = window.btoa(encodeURIComponent(string));

    data.setData('application/x-slate-fragment', encoded);

    const html = getSelectedDomNode();
    if (html) {
      data.setData('text/html', html.innerHTML);
      data.setData('text/plain', getPlainText(html));
    }

    return true;
  }

  return false;
};
