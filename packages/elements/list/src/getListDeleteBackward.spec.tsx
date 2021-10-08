/** @jsx jsx */

import { SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../plate/src/utils/createEditorPlugins';
import { createListPlugin } from './createListPlugin';

jsx;

describe('li > lic * 2 with selection at second child start', () => {
  it('should merge the children', () => {
    const input = ((
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
    ) as any) as SPEditor;

    const expected = ((
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('li with selection at start', () => {
  it('should remove the list item', () => {
    const input = ((
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
    ) as any) as SPEditor;

    const expected = ((
      <editor>
        <hp>one</hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
