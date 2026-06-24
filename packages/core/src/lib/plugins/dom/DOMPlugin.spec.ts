import { defineEditorExtension } from '@platejs/plite';

import { createPlateRuntimeEditor } from '../../../react/editor/createPlateRuntimeEditor';

import { DOMPlugin } from './DOMPlugin';

const createRuntimeDomEditor = () => {
  const editor = createPlateRuntimeEditor({
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
    plugins: [DOMPlugin],
  });

  editor.update((tx) => {
    tx.selection.set({ offset: 0, path: [0, 0] });
  });

  return editor;
};

const installScrollSpy = (
  editor: ReturnType<typeof createRuntimeDomEditor>
) => {
  const scrollSpy = mock(() => {});

  editor.extend(
    defineEditorExtension({
      name: 'test:scroll-spy',
      setup() {
        return {
          api: {
            scrollIntoView: scrollSpy,
          },
        };
      },
    })
  );

  return scrollSpy;
};

describe('DOMPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('scrolls enabled operations while auto-scrolling is active', () => {
    const editor = createRuntimeDomEditor();
    const scrollSpy = installScrollSpy(editor);

    editor.update((tx) => {
      tx.dom.withScrolling(
        (scrollTx) => {
          scrollTx.text.insert('a');
          scrollTx.text.insert('b');
        },
        {
          mode: 'first',
          scrollOptions: { block: 'center' },
        }
      );
    });

    expect(scrollSpy).toHaveBeenCalledTimes(2);
    expect(scrollSpy.mock.calls).toEqual([
      [
        { offset: 0, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
      [
        { offset: 0, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
    ]);
  });

  it('skips scrolling when the current operation type is disabled', () => {
    const editor = createRuntimeDomEditor();
    const scrollSpy = installScrollSpy(editor);

    editor.update((tx) => {
      tx.dom.withScrolling(
        (scrollTx) => {
          scrollTx.text.insert('a');
        },
        {
          operations: { insert_text: false },
        }
      );
    });

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('stores prevSelection and clears currentKeyboardEvent on set_selection', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'ab' }], type: 'p' }],
      plugins: [DOMPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    const previousSelection = editor.read((state) => state.selection.get());

    editor.dom.currentKeyboardEvent = {} as any;
    editor.update((tx) => {
      tx.selection.set({ offset: 2, path: [0, 0] });
    });

    expect(editor.dom.prevSelection).toEqual(previousSelection);
    expect(editor.dom.currentKeyboardEvent).toBeNull();
  });
});
