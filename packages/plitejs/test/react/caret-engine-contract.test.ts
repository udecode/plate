import { SelectionApi } from 'plitejs';

import {
  getEditorLiveSelection,
  replace as editorReplace,
} from '../../src/internal';
import { applyEditableCaretMovement } from '../../src/react/editable/caret-engine';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { createEditor } from '../../src/react/plugin/with-react';

const createKeyDownEvent = (key: string) =>
  ({
    altKey: false,
    ctrlKey: false,
    currentTarget: document.createElement('div'),
    key,
    metaKey: false,
    nativeEvent: {
      altKey: false,
      ctrlKey: false,
      key,
      metaKey: false,
      shiftKey: false,
    },
    preventDefault: vi.fn(),
    shiftKey: false,
  }) as never;

test('caret movement tags the semantic command commit', () => {
  const editor = createEditor();

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
    selection,
  });

  expect(result.handled).toBe(true);
  expect(editor.read((state) => state.selection())).toEqual({
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
  expect(editor.read((state) => state.lastCommit())?.tags).toContain(
    'semantic-command'
  );
  runtime.destroy();
});

test.each([
  ['ArrowUp', { offset: 4, path: [0, 0] }],
  ['ArrowDown', { offset: 0, path: [3, 0] }],
] as const)(
  '%s collapses a multi-node selection at its outer edge',
  (key, point) => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { children: [{ text: 'zero' }], type: 'paragraph' },
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'two' }], type: 'paragraph' },
        { children: [{ text: 'three' }], type: 'paragraph' },
      ],
      selection: SelectionApi.nodes([[1], [2]]),
    });

    const runtime = new EditableDOMRuntime({ editor });
    const result = applyEditableCaretMovement({
      domPhaseScheduler: runtime.domPhaseScheduler,
      domStrategyRuntime: null,
      editor,
      event: createKeyDownEvent(key),
      selection: getEditorLiveSelection(editor),
    });

    expect(result.handled).toBe(true);
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: point,
      focus: point,
    });
    runtime.destroy();
  }
);
