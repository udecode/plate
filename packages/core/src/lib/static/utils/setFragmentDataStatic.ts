import type { Descendant } from '@platejs/slate';

import type { SlateEditor } from '../../editor';

import { getPlainText } from '../internal/getPlainText';
import {
  getSelectedDomBlocks,
  getSelectedDomNode,
} from './getSelectedDomBlocks';

export const setFragmentDataStatic = (
  editor: SlateEditor,
  e: React.ClipboardEvent<HTMLDivElement>
) => {
  const domBlocks = getSelectedDomBlocks();

  // only crossing multiple blocks
  if (domBlocks && domBlocks.length > 0) {
    e.preventDefault();

    const fragment: Descendant[] = [];

    Array.from(domBlocks).forEach((node: any) => {
      const blockId = node.dataset.slateId;
      const block = editor.api.node({ id: blockId, at: [] })!;
      fragment.push(block[0]);
    });

    const string = JSON.stringify(fragment);
    const encoded = window.btoa(encodeURIComponent(string));

    e.clipboardData.setData('application/x-slate-fragment', encoded);

    const html = getSelectedDomNode();
    if (html) {
      e.clipboardData.setData('text/html', html.innerHTML);
      e.clipboardData.setData('text/plain', getPlainText(html));
    }
  }
};
