import type { Descendant, EditorTextChangeContext } from '@platejs/plite';

import { createBaseEditor } from '../editor';
import { type AnyBasePlugin, createBasePlugin } from '../plugin';
import { pipeOnTextChange } from './pipeOnTextChange';

type OnTextChange = NonNullable<
  NonNullable<AnyBasePlugin['handlers']>['onTextChange']
>;

const createTextChangePlugin = (key: string, onTextChange: OnTextChange) =>
  createBasePlugin({
    key,
    handlers: { onTextChange },
  });

const node: Descendant = { text: 'node' };
const createTextChange = (
  editor: ReturnType<typeof createBaseEditor>
): EditorTextChangeContext<ReturnType<typeof createBaseEditor>> => ({
  commit: editor.read.lastCommit()!,
  editor,
  node,
  path: [0],
  previousPath: [0],
  prevText: 'prev',
  root: 'main',
  text: 'next',
});

describe('pipeOnTextChange', () => {
  it('skips handlers when the editor is read-only', () => {
    const onTextChange = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createTextChangePlugin('test', onTextChange as unknown as OnTextChange),
      ],
      readOnly: true,
    });

    onTextChange.mockClear();

    expect(pipeOnTextChange(editor, createTextChange(editor))).toBe(false);
    expect(onTextChange).not.toHaveBeenCalled();
  });

  it('continues until a handler returns true, then stops', () => {
    const first = mock(() => {});
    const second = mock(() => true);
    const third = mock(() => true);

    const editor = createBaseEditor({
      plugins: [
        createTextChangePlugin('first', first as unknown as OnTextChange),
        createTextChangePlugin('second', second as unknown as OnTextChange),
        createTextChangePlugin('third', third as unknown as OnTextChange),
      ],
    });

    first.mockClear();
    second.mockClear();
    third.mockClear();

    expect(pipeOnTextChange(editor, createTextChange(editor))).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).not.toHaveBeenCalled();
    expect(second.mock.calls[0]?.[0]).toMatchObject({
      node,
      prevText: 'prev',
      root: undefined,
      text: 'next',
    });
  });
});
