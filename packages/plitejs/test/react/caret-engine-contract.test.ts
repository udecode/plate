import { SelectionApi } from 'plitejs';

import { applyEditableCaretMovement } from '../../src/react/editable/caret-engine';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { subscribeSource } from '../../src/react/editable/runtime-editor-api';
import { createEditor } from '../../src/react/plugin/with-react';
import { readPliteViewSelection } from '../../src/react/view-selection';
import {
  getEditorLiveSelection,
  replace as editorReplace,
} from '../../src/testing';

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

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
    viewportRuntime: null,
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
      selection: SelectionApi.nodes([[1], [2]], { mode: 'block' }),
    });

    const runtime = new EditableDOMRuntime({ editor });
    const result = applyEditableCaretMovement({
      domPhaseScheduler: runtime.domPhaseScheduler,
      viewportRuntime: null,
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

test('a large-document Shift+ArrowDown that a commit listener overtakes keeps the newer native caret', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: Array.from({ length: 1000 }, () => ({
      children: [{ text: 'abcdef' }],
      type: 'paragraph',
    })),
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const root = document.createElement('div');
  const text = document.createTextNode('abcdef');

  root.append(text);
  document.body.append(root);

  const runtime = new EditableDOMRuntime({ editor });
  let placed = false;
  const stop = subscribeSource(editor, 'commit', () => {
    if (placed) return;
    placed = true;
    editor.update((tx) => tx.selection.set({ path: [2, 0], offset: 3 }));
    document.getSelection()!.collapse(text, 3);
  });
  const result = applyEditableCaretMovement({
    domPhaseScheduler: runtime.domPhaseScheduler,
    viewportRuntime: {
      mountedTopLevelRanges: [{ endIndex: 0, startIndex: 0 }],
      type: 'virtualized',
    },
    editor,
    event: {
      altKey: false,
      ctrlKey: false,
      currentTarget: root,
      key: 'ArrowDown',
      metaKey: false,
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowDown',
        metaKey: false,
        shiftKey: true,
      },
      preventDefault: vi.fn(),
      shiftKey: true,
    } as never,
    selection: getEditorLiveSelection(editor),
  });

  stop();
  await nextFrame();
  await nextFrame();

  const native = document.getSelection()!;

  expect([
    result.handled,
    placed,
    editor.read((state) => state.selection()),
    readPliteViewSelection(editor),
    native.anchorNode === text && native.anchorOffset,
  ]).toEqual([
    true,
    true,
    { anchor: { path: [2, 0], offset: 3 }, focus: { path: [2, 0], offset: 3 } },
    null,
    3,
  ]);
  runtime.destroy();
  root.remove();
});

test.each([
  ['before its microtask clear', (placeNewer: () => void) => placeNewer(), 0],
  [
    'between its microtask and frame clears',
    async (placeNewer: () => void) => {
      await Promise.resolve();
      placeNewer();
    },
    1,
  ],
] as const)(
  'a newer native caret exported %s survives a shown large-document Shift+ArrowDown selection',
  async (_, runBeforeClears, clearsBefore) => {
    const editor = createEditor();

    editorReplace(editor, {
      children: Array.from({ length: 1000 }, () => ({
        children: [{ text: 'abcdef' }],
        type: 'paragraph',
      })),
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    const root = document.createElement('div');
    const text = document.createTextNode('abcdef');

    root.append(text);
    document.body.append(root);

    const runtime = new EditableDOMRuntime({ editor });
    const { schedule } = runtime.domPhaseScheduler;
    const clears: string[] = [];

    vi.spyOn(runtime.domPhaseScheduler, 'schedule').mockImplementation(
      (phase, label, callback, options) =>
        schedule(
          phase,
          label,
          (frameTime) => {
            if (label.startsWith('clear-caret-view-selection')) {
              clears.push(label);
            }
            callback(frameTime);
          },
          options
        )
    );
    const result = applyEditableCaretMovement({
      domPhaseScheduler: runtime.domPhaseScheduler,
      viewportRuntime: {
        mountedTopLevelRanges: [{ endIndex: 0, startIndex: 0 }],
        type: 'virtualized',
      },
      editor,
      event: {
        altKey: false,
        ctrlKey: false,
        currentTarget: root,
        key: 'ArrowDown',
        metaKey: false,
        nativeEvent: {
          altKey: false,
          ctrlKey: false,
          key: 'ArrowDown',
          metaKey: false,
          shiftKey: true,
        },
        preventDefault: vi.fn(),
        shiftKey: true,
      } as never,
      selection: getEditorLiveSelection(editor),
    });
    const shown = readPliteViewSelection(editor) !== null;

    let clearsBeforeNewerPlacement: string[] = [];

    await runBeforeClears(() => {
      clearsBeforeNewerPlacement = [...clears];
      editor.update((tx) => tx.selection.set({ path: [2, 0], offset: 3 }));
      document.getSelection()!.collapse(text, 3);
    });
    await nextFrame();
    await nextFrame();

    const native = document.getSelection()!;

    expect([
      result.handled,
      shown,
      clearsBeforeNewerPlacement.length,
      clears,
      readPliteViewSelection(editor),
      native.anchorNode === text && native.anchorOffset,
    ]).toEqual([
      true,
      true,
      clearsBefore,
      [
        'clear-caret-view-selection-microtask',
        'clear-caret-view-selection-frame',
      ],
      null,
      3,
    ]);
    runtime.destroy();
    root.remove();
  }
);
