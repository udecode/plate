import { act, render } from '@testing-library/react';
import type { Range } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { createReactEditor, Editable, Slate } from '../src';
import {
  createEditableInputController,
  createEditableInputControllerState,
  resolveEditableImplicitTarget,
} from '../src/editable/input-controller';

const initialValue = [
  { type: 'paragraph', children: [{ text: 'one' }] },
  { type: 'paragraph', children: [{ text: 'two' }] },
];

const fallbackSelection: Range = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 3 },
};

const domSelectionForText = (text: string) => {
  const stringElement = Array.from(
    document.querySelectorAll('[data-slate-string]')
  ).find((element) => element.textContent === text);
  const textNode = stringElement?.firstChild;

  if (!textNode) {
    throw new Error(`Unable to find rendered text node for "${text}".`);
  }

  const selection = window.getSelection();

  if (!selection) {
    throw new Error('Window selection is not available.');
  }

  selection.removeAllRanges();
  selection.setBaseAndExtent(textNode, 0, textNode, text.length);
};

test('target runtime imports the current DOM selection for implicit editor commands', async () => {
  const editor = createReactEditor({ initialValue });
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  let scheduledSelectionSync = 0;

  act(() => {
    render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
  });

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set(fallbackSelection);
    });
  });

  domSelectionForText('two');

  const target = resolveEditableImplicitTarget({
    editor,
    inputController,
    request: {
      fallback: fallbackSelection,
      reason: 'implicit-target',
    },
    scheduleSelectionSync(callback) {
      scheduledSelectionSync++;
      callback();
    },
    syncDOMSelectionToEditor() {},
  });

  expect(target).toEqual({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 3 },
  });
  expect(scheduledSelectionSync).toBe(1);
});

test('Editable target runtime routes implicit block commands to the current DOM selection', async () => {
  const editor = createReactEditor({ initialValue });

  act(() => {
    render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
  });

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set(fallbackSelection);
    });
  });

  domSelectionForText('two');

  await act(async () => {
    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' } as never);
    });
  });

  expect(Editor.getChildren(editor)).toEqual([
    { type: 'paragraph', children: [{ text: 'one' }] },
    { type: 'heading-one', children: [{ text: 'two' }] },
  ]);
  expect(Editor.getSelection(editor)).toEqual({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 3 },
  });
});
