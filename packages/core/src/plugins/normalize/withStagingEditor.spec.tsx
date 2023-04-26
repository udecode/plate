/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { isText } from '@udecode/slate';
import { createPlateEditor } from '../../utils/index';

jsx;

describe('withStagingEditor', () => {
  it('normalizeNode', () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext>
            a
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        {
          key: 'testt',
          withOverrides: (e) => {
            const { normalizeNode } = e;

            e.normalizeNode = (entry) => {
              const [node] = entry;

              // mishandled case -> infinite loop
              if (isText(node)) {
                e.insertText(' ');
              }

              normalizeNode(entry);
            };

            return e;
          },
        },
      ],
    });

    editor.insertText('a');
    editor.undo();
    editor.redo();

    expect(editor.children).toEqual(output.children);
    expect(editor.errors[0].type).toBe('normalize');
  });

  it('apply', () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        {
          key: 'testt',
          withOverrides: (e) => {
            const { apply } = e;

            e.apply = (op) => {
              // infinite loop
              e.insertText(' ');

              apply(op);
            };

            return e;
          },
        },
      ],
    });

    editor.insertText('a');
    // TODO: Error: Cannot find a descendant at path [10]
    // editor.moveNodes({
    //   at: [10],
    //   to: [11],
    // });
    editor.undo();
    editor.redo();

    expect(editor.children).toEqual(output.children);
    expect(editor.errors[0].type).toBe('apply');
  });

  it('insertFragment', () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext>
            ab
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.insertFragment([{ text: 'a' }, { text: 'b' }]);
    // editor.undo();
    // editor.redo();

    expect(editor.children).toEqual(output.children);
    expect(editor.errors).toEqual([]);
  });
});
