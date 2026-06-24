import { createBasePlateEditor } from '../editor';
import { createEditorPlugin } from '../plugin';
import { pipeOnTextChange } from './pipeOnTextChange';

describe('pipeOnTextChange', () => {
  it('skips handlers when the editor is read-only', () => {
    const onTextChange = mock(() => true);
    const editor = createBasePlateEditor({
      plugins: [
        createEditorPlugin({
          handlers: { onTextChange },
          key: 'test',
        }),
      ],
    });

    onTextChange.mockClear();
    editor.dom.readOnly = true;

    expect(
      pipeOnTextChange(editor, { text: 'node' } as any, 'next', 'prev', {
        type: 'insert_text',
      } as any)
    ).toBe(false);
    expect(onTextChange).not.toHaveBeenCalled();
  });

  it('continues until a handler returns true, then stops', () => {
    const first = mock(() => {});
    const second = mock(() => true);
    const third = mock(() => true);
    const node = { text: 'node' } as any;
    const operation = { type: 'insert_text' } as any;

    const editor = createBasePlateEditor({
      plugins: [
        createEditorPlugin({
          handlers: { onTextChange: first },
          key: 'first',
        }),
        createEditorPlugin({
          handlers: { onTextChange: second },
          key: 'second',
        }),
        createEditorPlugin({
          handlers: { onTextChange: third },
          key: 'third',
        }),
      ],
    });

    first.mockClear();
    second.mockClear();
    third.mockClear();

    expect(pipeOnTextChange(editor, node, 'next', 'prev', operation)).toBe(
      true
    );
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).not.toHaveBeenCalled();
    expect(second.mock.calls[0]?.[0]).toMatchObject({
      node,
      operation,
      prevText: 'prev',
      text: 'next',
    });
  });
});
