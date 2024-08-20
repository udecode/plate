/** @jsx jsx */

import {
  type SlateEditor,
  createSlateEditor,
  getNode,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { ListPlugin } from '../../react';

jsx;

describe('clean up list items', () => {
  it('should move children up from sublis if their parent has no lic', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    const path = [0, 0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });
});
