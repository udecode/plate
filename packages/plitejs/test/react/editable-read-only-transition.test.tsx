import { act, fireEvent, render } from '@testing-library/react';

import { createEditor, Editable, EditorRoot } from '../../src/react';

test('locking an editable does not rerender when native read-only state catches up', async () => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'draft' }] }],
  });
  const tree = (readOnly: boolean) => (
    <EditorRoot editor={editor}>
      <Editable aria-label="Draft" readOnly={readOnly} />
    </EditorRoot>
  );
  const mounted = render(tree(false));
  await act(async () => {});
  const previousProfiler = globalThis.__EDITOR_REACT_RENDER_PROFILER__;
  let editableRenders = 0;
  globalThis.__EDITOR_REACT_RENDER_PROFILER__ = {
    record(event) {
      if (event.kind === 'editable') editableRenders += 1;
    },
  };

  try {
    await act(async () => mounted.rerender(tree(true)));
    expect(editableRenders).toBe(1);
    expect(mounted.getByRole('textbox').getAttribute('aria-readonly')).toBe(
      'true'
    );

    await act(async () => mounted.rerender(tree(false)));
    expect(
      mounted.getByRole('textbox').getAttribute('aria-readonly')
    ).toBeNull();
  } finally {
    globalThis.__EDITOR_REACT_RENDER_PROFILER__ = previousProfiler;
    mounted.unmount();
  }
});

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
      <EditorRoot editor={editor}>
        <Editable
          aria-label="Draft"
          readOnly={locked}
          onKeyDown={handleInput}
          onDOMBeforeInput={handleInput}
        />
      </EditorRoot>
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
