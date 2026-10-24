import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { createEditor, Editable, EditorRoot } from '../../src/react';

const pointer = (
  type: 'pointerDown' | 'pointerUp',
  target: Element,
  pointerType: string
) => {
  const event = createEvent[type](target);
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(target, event);
};

const renderWithStaleCaret = () => {
  const editor = createEditor({
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'This is editable text' }] },
      ],
    },
  });

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  render(
    <EditorRoot editor={editor}>
      <Editable aria-label="Main editor" />
    </EditorRoot>
  );

  const editable = screen.getByLabelText('Main editor');
  const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
  let text = walker.nextNode();
  while (text && !text.textContent?.includes('editable')) {
    text = walker.nextNode();
  }
  if (!text?.parentElement) throw new Error('Missing text node');

  return { editable, text };
};

const nativeWordSelectionAfterFocus = async (
  pointerType: string,
  { released = false } = {}
) => {
  const { editable, text } = renderWithStaleCaret();

  pointer('pointerDown', text.parentElement!, pointerType);
  if (released) {
    pointer('pointerUp', text.parentElement!, pointerType);
    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 0);
        })
    );
  }
  getSelection()!.setBaseAndExtent(text, 8, text, 16);

  await act(async () => {
    editable.focus();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  const selection = getSelection()!;

  return [selection.anchorOffset, selection.focusOffset];
};

describe('focus during a touch press', () => {
  test('keeps the word a touch long press selected', async () => {
    expect(await nativeWordSelectionAfterFocus('touch')).toEqual([8, 16]);
  });

  test('a later programmatic focus after the touch ends restores the model caret', async () => {
    expect(
      await nativeWordSelectionAfterFocus('touch', { released: true })
    ).toEqual([0, 0]);
  });

  test('a mouse pointerdown alone does not hold the native selection', async () => {
    expect(await nativeWordSelectionAfterFocus('mouse')).toEqual([0, 0]);
  });
});
