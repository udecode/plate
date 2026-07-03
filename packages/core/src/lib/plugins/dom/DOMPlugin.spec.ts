import { defineEditorExtension } from '@platejs/plite';

import { createBaseEditor } from '../../editor';
import { DOMPlugin } from './DOMPlugin';

const value = [{ children: [{ text: '' }], type: 'p' }];

describe('DOMPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('scrolls enabled operations while auto-scrolling is active', () => {
    const scrollSpy = mock((..._args: unknown[]) => {});
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
    );

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
    const scrollSpy = mock((..._args: unknown[]) => {});
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
    );

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

  it('scrolls inserted nodes when insert_node is enabled', () => {
    const scrollSpy = mock((..._args: unknown[]) => {});
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
    );

    editor.update((tx) => {
      tx.dom.autoScroll((scrollTx) => {
        scrollTx.nodes.insert(
          { children: [{ text: '' }], type: 'p' },
          { at: [1] }
        );
      });
    });

    expect(scrollSpy).toHaveBeenCalledWith(
      { offset: 0, path: [1] },
      { scrollMode: 'if-needed' }
    );
  });

  it('passes explicit scroll options through to Plite DOM', () => {
    const scrollSpy = mock((..._args: unknown[]) => {});
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
    );

    editor.update((tx) => {
      tx.dom.autoScroll(
        (scrollTx) => {
          scrollTx.text.insert('a');
        },
        {
          scrollOptions: { block: 'end', scrollMode: 'always' },
        }
      );
    });

    expect(scrollSpy).toHaveBeenCalledWith(
      { offset: 0, path: [0, 0] },
      { block: 'end', scrollMode: 'always' }
    );
  });

  it('passes boolean scroll options through to Plite DOM', () => {
    const scrollSpy = mock((..._args: unknown[]) => {});
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
    );

    editor.update((tx) => {
      tx.dom.autoScroll(
        (scrollTx) => {
          scrollTx.text.insert('a');
        },
        {
          scrollOptions: false,
        }
      );
    });

    expect(scrollSpy).toHaveBeenCalledWith({ offset: 0, path: [0, 0] }, false);
  });

  it('maps temporary scrolling options and restores them after the callback', () => {
    const editor = createBaseEditor();
    const previousOptions = { ...editor.getOptions(DOMPlugin) };
    let callbackOptions: typeof previousOptions | undefined;
    let callbackScrolling = false;

    editor.update((tx) => {
      tx.dom.autoScroll(
        () => {
          callbackOptions = editor.getOptions(DOMPlugin);
          callbackScrolling = editor.api.dom.isAutoScrolling();
        },
        {
          mode: 'first',
          operations: {
            insert_node: false,
          },
          scrollOptions: {
            block: 'center',
          },
        }
      );
    });

    expect(callbackScrolling).toBe(true);
    expect(callbackOptions?.scrollMode).toBe('first');
    expect(callbackOptions?.scrollOperations).toMatchObject({
      insert_node: false,
      insert_text: true,
    });
    expect(callbackOptions?.scrollOptions).toEqual({
      block: 'center',
      scrollMode: 'if-needed',
    });
    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.getOptions(DOMPlugin)).toEqual(previousOptions);
  });

  it('restores scrolling state even if the callback throws', () => {
    const editor = createBaseEditor();
    const previousOptions = { ...editor.getOptions(DOMPlugin) };

    expect(() =>
      editor.update((tx) => {
        tx.dom.autoScroll(
          () => {
            throw new Error('boom');
          },
          { mode: 'first' }
        );
      })
    ).toThrow('boom');

    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.getOptions(DOMPlugin)).toEqual(previousOptions);
  });

  it('exposes Plate auto-scroll state and leaves view state on the Plite view', () => {
    const editor = createBaseEditor({
      value,
    });

    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.read.view.isComposing()).toBe(false);
    expect(editor.read.view.isFocused()).toBe(false);
    expect(editor.read.view.isReadOnly()).toBe(false);

    const readOnlyEditor = createBaseEditor({
      readOnly: true,
      value,
    });

    expect(readOnlyEditor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves host DOM focus API', () => {
    const focusSpy = mock(() => {});
    const editor = createBaseEditor({
      value,
    });
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            focus: focusSpy,
          },
        },
        name: 'test:host-dom',
      })
    );

    editor.api.dom.focus({ retries: 1 });

    expect(focusSpy).toHaveBeenCalledWith({ retries: 1 });
  });
});
