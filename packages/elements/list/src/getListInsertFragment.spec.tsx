/** @jsx jsx */

import { SPEditor, TDescendant } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../plate/src/utils/createEditorPlugins';
import { createListPlugin } from './createListPlugin';

jsx;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createEditorPlugins({
    editor: input,
    plugins: [createListPlugin()],
  });

  editor.insertFragment(fragment);

  expect(editor.children).toEqual(expected.children);
};

describe('when pasting ul > 2 li fragment', () => {
  describe('when selection in li', () => {
    it('should filter out ul', () => {
      const input = ((
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection not in li', () => {
    it('should paste the list', () => {
      const input = ((
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any) as SPEditor;

      const fragment = ((
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any) as TDescendant[];

      const expected = ((
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as any) as SPEditor;

      editorTest(input, fragment, expected);
    });
  });
});
