import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin';
import { pipeOnNodeChange } from './pipeOnNodeChange';

describe('pipeOnNodeChange', () => {
  it('skips handlers when the editor is read-only', () => {
    const onNodeChange = mock(() => true);
    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          handlers: { onNodeChange },
          key: 'test',
        }),
      ],
    });

    onNodeChange.mockClear();
    editor.dom.readOnly = true;

    expect(
      pipeOnNodeChange(
        editor,
        { text: 'next' } as any,
        { text: 'prev' } as any,
        { type: 'insert_node' } as any
      )
    ).toBe(false);
    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('continues until a handler returns true, then stops', () => {
    const first = mock(() => {});
    const second = mock(() => true);
    const third = mock(() => true);
    const node = { text: 'next' } as any;
    const prevNode = { text: 'prev' } as any;
    const operation = { type: 'insert_node' } as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          handlers: { onNodeChange: first },
          key: 'first',
        }),
        createSlatePlugin({
          handlers: { onNodeChange: second },
          key: 'second',
        }),
        createSlatePlugin({
          handlers: { onNodeChange: third },
          key: 'third',
        }),
      ],
    });

    first.mockClear();
    second.mockClear();
    third.mockClear();

    expect(pipeOnNodeChange(editor, node, prevNode, operation)).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).not.toHaveBeenCalled();
    expect(second.mock.calls[0]?.[0]).toMatchObject({
      node,
      operation,
      prevNode,
    });
  });
});
