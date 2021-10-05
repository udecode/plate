/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate/src';
import { getNode } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createListPlugin } from '../createListPlugin';
import { Editor } from 'slate';

jsx;

describe('clean up list items', () => {
  it('should move children up from sublis if their parent has no lic', () => {
    const input = ((
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
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    const path = [0, 0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });
});

describe('validLiChildrenTypes', () => {
  it('should replace children block item with lic', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              <element>
                <hp>hell</hp>
              </element>
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as Editor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as Editor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    const path = [0, 0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });

  it('should keep children block item when it is listed as valid', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              <element>
                <hp>hell</hp>
              </element>
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as Editor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as Editor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin({ validLiChildrenTypes: ['element'] })],
    });

    const path = [0, 0];
    const node = getNode(editor, path);

    editor.normalizeNode([node!, path]);

    expect(input.children).toEqual(output.children);
  });
});
