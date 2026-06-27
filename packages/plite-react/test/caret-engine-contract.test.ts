import { replace as editorReplace } from '@platejs/plite/internal';

import { applyEditableCaretMovement } from '../src/editable/caret-engine';
import { createReactEditor } from '../src/plugin/with-react';

const createKeyDownEvent = (key: string) =>
  ({
    currentTarget: document.createElement('div'),
    nativeEvent: {
      altKey: false,
      ctrlKey: false,
      key,
      metaKey: false,
      shiftKey: false,
    },
    preventDefault: vi.fn(),
  }) as never;

test('caret movement preserves core move_selection commit metadata', () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        children: [{ text: 'one' }],
        type: 'paragraph',
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const selection = editor.read((state) => state.selection.get());
  const result = applyEditableCaretMovement({
    domStrategyRuntime: null,
    editor,
    event: createKeyDownEvent('ArrowRight'),
    isRTL: false,
    selection,
  });

  expect(result.handled).toBe(true);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
  expect(editor.read((state) => state.value.lastCommit())?.command).toEqual({
    origin: 'command',
    type: 'move_selection',
  });
});
