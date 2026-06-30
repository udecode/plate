import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';

const value = [{ children: [{ text: '' }], type: 'p' }];

describe('DOMPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('scrolls enabled operations while auto-scrolling is active', () => {
    const scrollSpy = mock(() => {}) as any;
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({ key: 'scrollSpy' }).extendEditorApi(() => ({
          scrollIntoView: scrollSpy,
        })),
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });

    editor.update((tx) => {
      tx.dom.autoScroll(
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
    const scrollSpy = mock(() => {}) as any;
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({ key: 'scrollSpy' }).extendEditorApi(() => ({
          scrollIntoView: scrollSpy,
        })),
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });

    editor.update((tx) => {
      tx.dom.autoScroll(
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

  it('exposes stable DOM state through editor.api.dom', () => {
    const editor = createBaseEditor({
      value,
    });

    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.api.dom.isComposing()).toBe(false);
    expect(editor.api.dom.isFocused()).toBe(false);
    expect(editor.api.dom.isReadOnly()).toBe(false);

    const readOnlyEditor = createBaseEditor({
      readOnly: true,
      value,
    });

    expect(readOnlyEditor.api.dom.isReadOnly()).toBe(true);
  });
});
