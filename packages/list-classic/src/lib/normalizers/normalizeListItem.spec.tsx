/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

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
    ) as TestEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(output.children);
  });
});
