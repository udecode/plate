import { EDITOR_TO_FORCE_RENDER } from '@platejs/plite-dom/internal';
import { act, render, renderHook } from '@testing-library/react';

import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
import {
  shouldExportPendingModelSelection,
  useRuntimeRepairEngine,
} from '../src/editable/runtime-repair-engine';
import {
  ReactEditor,
  type ReactRuntimeEditor,
} from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

const createRuntime = (editor: ReactRuntimeEditor) =>
  new EditableDOMRuntime({ editor });

const renderRepairEngine = (editor: ReactRuntimeEditor) => {
  const runtime = createRuntime(editor);

  return renderHook(() =>
    useRuntimeRepairEngine({
      runtime,
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor: vi.fn(),
    })
  );
};

test('exports the unchanged composition selection after its repair render', () => {
  const editor = createReactEditor();
  const runtime = createRuntime(editor);
  const syncDOMSelectionToEditor = vi.fn();
  const isFocused = vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);
  const { result } = renderHook(() =>
    useRuntimeRepairEngine({
      runtime,
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor,
    })
  );

  act(() => result.current.requestModelSelectionExportAfterRender());

  expect(syncDOMSelectionToEditor).toHaveBeenCalledOnce();
  isFocused.mockRestore();
});

test('does not export composition selection after focus leaves the editor', () => {
  const editor = createReactEditor();
  const runtime = createRuntime(editor);
  const syncDOMSelectionToEditor = vi.fn();
  let focused = true;
  const isFocused = vi
    .spyOn(ReactEditor, 'isFocused')
    .mockImplementation(() => focused);
  const { result } = renderHook(() =>
    useRuntimeRepairEngine({
      runtime,
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor,
    })
  );

  act(() => {
    result.current.requestModelSelectionExportAfterRender();
    focused = false;
  });

  expect(syncDOMSelectionToEditor).not.toHaveBeenCalled();
  isFocused.mockRestore();
});

test('does not export when model selection drifts before the repair render', () => {
  const editor = createReactEditor({
    initialSelection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    },
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
  });
  const runtime = createRuntime(editor);
  const syncDOMSelectionToEditor = vi.fn();
  const isFocused = vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);
  const { result } = renderHook(() =>
    useRuntimeRepairEngine({
      runtime,
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor,
    })
  );

  act(() => {
    result.current.requestModelSelectionExportAfterRender();
    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 1 });
    });
  });

  expect(syncDOMSelectionToEditor).not.toHaveBeenCalled();
  isFocused.mockRestore();
});

test('does not export a stale composition selection after a newer commit', () => {
  const editor = createReactEditor();
  const snapshot = editor.read.runtime.snapshot();

  expect(
    shouldExportPendingModelSelection(
      snapshot,
      {
        ...snapshot,
        version: snapshot.version + 1,
      },
      true
    )
  ).toBe(false);
});

test('does not export when selection changes without a document commit', () => {
  const editor = createReactEditor();
  const snapshot = editor.read.runtime.snapshot();
  expect(
    shouldExportPendingModelSelection(
      snapshot,
      {
        ...snapshot,
        selection: {
          anchor: { offset: 0, path: [0] },
          focus: { offset: 0, path: [0] },
          kind: 'text',
        },
      },
      true
    )
  ).toBe(false);
});

test('settles only the latest explicit focus target after the repair render', () => {
  const editor = createReactEditor();
  const staleTarget = createReactEditor();
  const target = createReactEditor();
  const focus = vi.spyOn(ReactEditor, 'focus').mockImplementation(() => {});
  const { result } = renderRepairEngine(editor);
  const requestRepair = result.current.requestEditableRepair as unknown as (
    request: { forceRender: true; kind: 'force-render' },
    options: { focusEditor: ReactRuntimeEditor }
  ) => void;

  try {
    act(() => {
      requestRepair(
        { forceRender: true, kind: 'force-render' },
        { focusEditor: staleTarget }
      );
      requestRepair(
        { forceRender: true, kind: 'force-render' },
        { focusEditor: target }
      );
    });

    expect(focus).toHaveBeenNthCalledWith(1, staleTarget);
    expect(focus).toHaveBeenNthCalledWith(2, target);
    expect(focus).toHaveBeenNthCalledWith(3, target);

    act(() => result.current.forceRender());

    expect(focus).toHaveBeenCalledTimes(3);
  } finally {
    focus.mockRestore();
  }
});

test('fails closed when an explicit focus target is unavailable after render', () => {
  const editor = createReactEditor();
  const target = createReactEditor();
  const focus = vi.spyOn(ReactEditor, 'focus').mockImplementation(() => {
    throw new Error('unmounted target');
  });
  const { result } = renderRepairEngine(editor);

  try {
    expect(() => {
      act(() => {
        result.current.requestEditableRepair(
          { forceRender: true, kind: 'force-render' },
          { focusEditor: target }
        );
      });
    }).not.toThrow();
    expect(focus).toHaveBeenCalledTimes(2);
    expect(focus).toHaveBeenNthCalledWith(1, target);
    expect(focus).toHaveBeenNthCalledWith(2, target);
  } finally {
    focus.mockRestore();
  }
});

test('repair engine registers force render only after commit and cleans up on unmount', () => {
  const editor = createReactEditor();
  const ThrowingHarness = () => {
    useRuntimeRepairEngine({
      runtime: createRuntime(editor),
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor: vi.fn(),
    });
    throw new Error('abort render');
  };
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  try {
    expect(() => render(<ThrowingHarness />)).toThrow('abort render');
  } finally {
    consoleError.mockRestore();
  }

  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBeUndefined();

  const { result, unmount } = renderRepairEngine(editor);

  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBe(result.current.forceRender);

  unmount();

  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBeUndefined();
});

test('repair engine cleanup preserves a newer force render for the same editor', () => {
  const editor = createReactEditor();
  const first = renderRepairEngine(editor);
  const firstForceRender = first.result.current.forceRender;
  const second = renderRepairEngine(editor);
  const secondForceRender = second.result.current.forceRender;

  expect(secondForceRender).not.toBe(firstForceRender);
  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBe(secondForceRender);

  first.unmount();

  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBe(secondForceRender);

  second.unmount();

  expect(EDITOR_TO_FORCE_RENDER.get(editor)).toBeUndefined();
});
