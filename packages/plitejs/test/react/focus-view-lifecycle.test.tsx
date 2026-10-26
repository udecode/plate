import { act, fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';

import { FOCUS_SETTLE_TIMEOUT } from '../../src/dom/plugin/dom-editor';
import {
  createEditor,
  Editable,
  EditorRoot,
  useEditorFocused,
} from '../../src/react';

function FocusState() {
  return <output data-testid="focused">{String(useEditorFocused())}</output>;
}

test.each([false, true])(
  'editable disposal clears focus and its replacement can focus again (strict: %s)',
  async (strict) => {
    const editor = createEditor();
    function App({ visible = true }: { visible?: boolean }) {
      return (
        <EditorRoot editor={editor}>
          {visible && <Editable aria-label="editor" />}
          <FocusState />
        </EditorRoot>
      );
    }
    const wrapper = (visible = true) =>
      strict ? (
        <StrictMode>
          <App visible={visible} />
        </StrictMode>
      ) : (
        <App visible={visible} />
      );
    const view = render(wrapper());
    await act(async () => view.getByRole('textbox').focus());
    expect(view.getByTestId('focused').textContent).toBe('true');
    await act(async () => view.rerender(wrapper(false)));
    expect(editor.api.dom.isFocused()).toBe(false);
    expect(view.getByTestId('focused').textContent).toBe('false');
    await act(async () => view.rerender(wrapper()));
    expect(view.getByTestId('focused').textContent).toBe('false');
    await act(async () => view.getByRole('textbox').focus());
    expect(view.getByTestId('focused').textContent).toBe('true');
  }
);

test('an editor refocused right after an outside press reports focus', async () => {
  const editor = createEditor();
  const view = render(
    <EditorRoot editor={editor}>
      <Editable aria-label="editor" />
      <button type="button">outside</button>
      <FocusState />
    </EditorRoot>
  );
  const textbox = view.getByRole('textbox');
  const outside = view.getByRole('button', { name: 'outside' });

  await act(async () => textbox.focus());
  await act(async () => {
    outside.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );
    outside.focus();
    // A popover returns focus to the editor before the press settles.
    textbox.focus();
  });

  expect(document.activeElement).toBe(textbox);
  expect(view.getByTestId('focused').textContent).toBe('true');
});

test('a caret key keeps the selection it moves from a focus request still settling', async () => {
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Hello' }] },
      { type: 'paragraph', children: [{ text: 'World' }] },
    ],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <Editable aria-label="editor" />
    </EditorRoot>
  );
  const textbox = view.getByRole('textbox');
  const [hello, world] = [
    ...textbox.querySelectorAll('[data-editor-string]'),
  ].map((string) => string.firstChild!);
  const wait = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  // WebKit can report the key's selection move after the settle timeout.
  const holdSelectionChange = (event: Event) =>
    event.stopImmediatePropagation();

  await act(async () => {
    textbox.focus();
    editor.update((tx) => tx.selection.set({ path: [1, 0], offset: 5 }));
  });
  await act(async () => {
    document.addEventListener('selectionchange', holdSelectionChange, true);
    editor.api.dom.focus();
    fireEvent.keyDown(textbox, { key: 'ArrowUp', shiftKey: true });
    await wait(10);
    document.getSelection()!.setBaseAndExtent(world, 5, hello, 5);
    await wait(FOCUS_SETTLE_TIMEOUT + 20);
    document.removeEventListener('selectionchange', holdSelectionChange, true);
    document.dispatchEvent(new Event('selectionchange'));
    await wait(20);
  });

  expect(editor.read((state) => state.selection())).toEqual({
    anchor: { offset: 5, path: [1, 0] },
    focus: { offset: 5, path: [0, 0] },
  });
});
