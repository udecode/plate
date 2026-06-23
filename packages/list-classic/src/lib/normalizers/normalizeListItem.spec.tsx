/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import type { BasePlateEditor } from '@platejs/core';
import { createListClassicTestEditor as createBasePlateEditor } from '../__tests__/createListClassicTestEditor';

import { BaseListPlugin } from '../BaseListPlugin';

jsxt;

describe('clean up list items', () => {
  it('move children up from sublis if their parent has no lic', () => {
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
    ) as any as BasePlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => tx.normalize({ force: true }));

    expect(editor.children).toEqual(output.children);
  });
});
