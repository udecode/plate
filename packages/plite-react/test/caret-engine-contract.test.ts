import { replace as editorReplace } from '@platejs/plite/internal';

import { applyEditableCaretMovement } from '../src/editable/caret-engine';
import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
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

test('caret movement tags the semantic command commit', () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [
      {
        children: [{ text: 'one' }],
        type: 'paragraph',
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const selection = editor.read((state) => state.selection());
  const runtime = new EditableDOMRuntime({ editor });
  const result = applyEditableCaretMovement({
    domPhaseScheduler: runtime.domPhaseScheduler,
    domStrategyRuntime: null,
    editor,
    event: createKeyDownEvent('ArrowRight'),
    isRTL: false,
    selection,
  });

  expect(result.handled).toBe(true);
  expect(editor.read((state) => state.selection())).toEqual({
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
  expect(editor.read((state) => state.lastCommit())?.tags).toContain(
    'semantic-command'
  );
  runtime.destroy();
});
