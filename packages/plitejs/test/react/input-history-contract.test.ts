import {
  createNativeGroupingId,
  getNativeTextInputUpdateTags,
  nativeGroupingInput,
  updateNativeTextInput,
} from '../../src/react/editable/input-history';
import {
  beginEditableCompositionSession,
  createEditableInputController,
  createEditableInputControllerState,
  getEditableNativeGroupingInput,
} from '../../src/react/editable/input-state';
import { createEditor } from '../../src/react/plugin/with-react';

test('native text input has no React-local clock or location policy', () => {
  expect(getNativeTextInputUpdateTags()).toEqual(['native-text-input']);
  expect(getNativeTextInputUpdateTags()).toEqual(['native-text-input']);
});

test('allocates stable numeric source and composition identities', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const origin = inputController.nativeHistoryOrigin;

  expect(Number.isSafeInteger(origin)).toBe(true);
  expect(getEditableNativeGroupingInput(inputController, false)).toEqual({
    origin,
  });

  beginEditableCompositionSession(inputController);
  const first = getEditableNativeGroupingInput(inputController, true);
  beginEditableCompositionSession(inputController);
  const second = getEditableNativeGroupingInput(inputController, true);

  expect(first.origin).toBe(origin);
  expect(first.composition).not.toBeUndefined();
  expect(second.origin).toBe(origin);
  expect(second.composition).not.toBe(first.composition);
  expect(createNativeGroupingId()).toBeGreaterThan(second.composition ?? 0);
});

test('publishes native source metadata on the canonical update', () => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  const input = { composition: 9, origin: 7 };

  updateNativeTextInput(
    editor,
    (tx) => {
      tx.text.insert('a', { at: { path: [0, 0], offset: 0 } });
    },
    input
  );

  const commit = editor.read((state) => state.lastCommit());

  expect(commit?.tags).toContain('native-text-input');
  expect(commit?.annotations[nativeGroupingInput.key]).toEqual(input);
});
