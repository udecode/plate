import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';

import {
  createEditor,
  Editable,
  Plite,
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
        <Plite editor={editor}>
          {visible && <Editable aria-label="editor" />}
          <FocusState />
        </Plite>
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
