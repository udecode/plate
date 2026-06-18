import { render, renderHook } from '@testing-library/react';
import { EDITOR_TO_FORCE_RENDER } from '@platejs/slate-dom/internal';

import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-controller';
import { useRuntimeRepairEngine } from '../src/editable/runtime-repair-engine';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

const createInputController = () =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

const renderRepairEngine = (editor: ReactRuntimeEditor) =>
  renderHook(() =>
    useRuntimeRepairEngine({
      editor,
      inputController: createInputController(),
      scrollSelectionIntoView: vi.fn(),
      syncDOMSelectionToEditor: vi.fn(),
    })
  );

test('repair engine registers force render only after commit and cleans up on unmount', () => {
  const editor = createReactEditor();
  const ThrowingHarness = () => {
    useRuntimeRepairEngine({
      editor,
      inputController: createInputController(),
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
