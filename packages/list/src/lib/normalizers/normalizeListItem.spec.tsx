/** @jsx jsxt */

import { type SlateEditor, createSlateEditor, NodeApi } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { ListPlugin } from '../../react';

jsxt;

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
      plugins: [ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    const path = [0, 0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children).toEqual(output.children);
  });
});
