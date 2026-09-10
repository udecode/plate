import { act, fireEvent, render } from '@testing-library/react';

import { createEditor, Editable, Plite } from '../../src/react';

test.each([
  [false, 'keyboard'],
  [true, 'keyboard'],
  [false, 'beforeinput'],
  [true, 'beforeinput'],
] as const)(
  'uses the committed readOnly=%s policy for the first %s event',
  async (readOnly, input) => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'draft' }] }],
    });
    const handleInput = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
      return true;
    });
    const tree = (locked: boolean) => (
      <Plite editor={editor}>
        <Editable
          aria-label="Draft"
          readOnly={locked}
          onKeyDown={handleInput}
          onDOMBeforeInput={handleInput}
        />
      </Plite>
    );
    const mounted = render(tree(!readOnly));
    const textbox = mounted.getByRole('textbox', { name: 'Draft' });
    try {
      await act(async () => {
        textbox.focus();
        editor.update((tx) =>
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 0], offset: 5 },
            focus: { path: [0, 0], offset: 5 },
          })
        );
      });
      mounted.rerender(tree(readOnly));
      expect(textbox.getAttribute('aria-readonly')).toBe(
        readOnly ? 'true' : null
      );
      await act(async () => {
        if (input === 'keyboard') {
          fireEvent.keyDown(textbox, { key: 'x' });
        } else {
          fireEvent(
            textbox,
            new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              data: 'x',
              inputType: 'insertText',
            })
          );
        }
      });
      expect(handleInput).toHaveBeenCalledTimes(readOnly ? 0 : 1);
      expect(editor.read((state) => state.text.string([]))).toBe('draft');
    } finally {
      mounted.unmount();
    }
  }
);
