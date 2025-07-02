import type { Descendant } from '@platejs/slate';

import { DOMPlugin } from '../../plugins';
import { getPlainText } from '../internal/getPlainText';
import { getSelectedDomBlocks } from '../utils/getSelectedDomBlocks';
import { getSelectedDomNode } from '../utils/getSelectedDomNode';
import { isSelectOutside } from '../utils/isSelectOutside';

export const ViewPlugin = DOMPlugin.overrideEditor(
  ({ editor, tf: { setFragmentData } }) => ({
    transforms: {
      setFragmentData(data, originEvent) {
        if (originEvent !== 'copy') return setFragmentData(data, originEvent);

        const domBlocks = getSelectedDomBlocks();
        const html = getSelectedDomNode();

        if (!html || !domBlocks) return;

        const selectOutside = isSelectOutside(html);

        if (selectOutside) return;

        // only crossing multiple blocks
        if (domBlocks.length > 0) {
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
          data.setData('text/html', html.innerHTML);
          data.setData('text/plain', getPlainText(html));
        }
      },
    },
  })
);
