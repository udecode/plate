import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';

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
