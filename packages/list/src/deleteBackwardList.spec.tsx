/** @jsx jsx */

import { PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createListPlugin } from './createListPlugin';

jsx;

describe('li > lic * 2 with selection at second child start', () => {
  it('should merge the children', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hlic>
              <cursor />
              two
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('li with selection at start', () => {
  it('should remove the list item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />
              one
            </hlic>
          </hli>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>one</hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
