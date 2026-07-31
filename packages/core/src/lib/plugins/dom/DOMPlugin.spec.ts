import { DocumentChange } from '@platejs/plite';
import { DOMEditor } from '@platejs/plite-dom/internal';

import { createBaseEditor } from '../../editor';
import { DOMPlugin } from './DOMPlugin';

const value = [{ children: [{ text: '' }], type: 'p' }];

describe('DOMPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('scrolls enabled canonical changes while auto-scrolling is active', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: value,
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
    expect(scrollSpy.mock.calls.map((call) => call.slice(1))).toEqual([
      [
        { offset: 1, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
      [
        { offset: 1, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
    ]);
  });

  it('skips scrolling when the current change kind is disabled', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: value,
    });
    editor.update((tx) => {
      tx.dom.autoScroll(
        (scrollTx) => {
          scrollTx.text.insert('a');
        },
        {
          changes: { text: false },
        }
      );
    });

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('scrolls inserted nodes when structure changes are enabled', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: value,
    });
    editor.update((tx) => {
      tx.dom.autoScroll((scrollTx) => {
        scrollTx.nodes.insert(
          { children: [{ text: '' }], type: 'p' },
          { at: [1] }
        );
      });
    });

    expect(scrollSpy.mock.calls.at(-1)?.slice(1)).toEqual([
      [1],
      { scrollMode: 'if-needed' },
    ]);
  });

  it('scrolls an explicit text target instead of an unrelated selection', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ],
    });
    editor.update((tx) => {
      tx.dom.autoScroll((scrollTx) => {
        scrollTx.text.insert('x', { at: { offset: 0, path: [1, 0] } });
      });
    });

    expect(scrollSpy.mock.calls.at(-1)?.slice(1)).toEqual([
      [1, 0],
      { scrollMode: 'if-needed' },
    ]);
  });

  it('scrolls the exact target of a classification-free change', () => {
    const twoBlocks = [
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ];
    const source = createBaseEditor({
      initialValue: twoBlocks,
    });

    source.update.text.insert('x', { at: { offset: 0, path: [1, 0] } });

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: twoBlocks,
    });
    expect(change.primaryClassification).toBeNull();
    editor.update((tx) => {
      tx.dom.autoScroll((scrollTx) => scrollTx.changes.apply(change));
    });

    expect(scrollSpy.mock.calls.at(-1)?.slice(1)).toEqual([
      [1, 0],
      { scrollMode: 'if-needed' },
    ]);
  });

  it('passes explicit scroll options through to Plite DOM', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: value,
    });
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

    expect(scrollSpy.mock.calls.at(-1)?.slice(1)).toEqual([
      { offset: 1, path: [0, 0] },
      { block: 'end', scrollMode: 'always' },
    ]);
  });

  it('passes boolean scroll options through to Plite DOM', () => {
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createBaseEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: value,
    });
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

    expect(scrollSpy.mock.calls.at(-1)?.slice(1)).toEqual([
      { offset: 1, path: [0, 0] },
      false,
    ]);
  });

  it('maps temporary scrolling options and restores them after the callback', () => {
    const editor = createBaseEditor();
    const previousOptions = { ...editor.plugin(DOMPlugin).store.get() };
    let callbackOptions: typeof previousOptions | undefined;
    let callbackScrolling = false;

    editor.update((tx) => {
      tx.dom.autoScroll(
        () => {
          callbackOptions = editor.plugin(DOMPlugin).store.get();
          callbackScrolling = editor.api.dom.isAutoScrolling();
        },
        {
          mode: 'first',
          changes: {
            structure: false,
          },
          scrollOptions: {
            block: 'center',
          },
        }
      );
    });

    expect(callbackScrolling).toBe(true);
    expect(callbackOptions?.scrollMode).toBe('first');
    expect(callbackOptions?.scrollChanges).toMatchObject({
      structure: false,
      text: true,
    });
    expect(callbackOptions?.scrollOptions).toEqual({
      block: 'center',
      scrollMode: 'if-needed',
    });
    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.plugin(DOMPlugin).store.get()).toEqual(previousOptions);
  });

  it('restores scrolling state even if the callback throws', () => {
    const editor = createBaseEditor();
    const previousOptions = { ...editor.plugin(DOMPlugin).store.get() };

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
    expect(editor.plugin(DOMPlugin).store.get()).toEqual(previousOptions);
  });

  it('exposes Plate auto-scroll state and leaves view state on the Plite view', () => {
    const editor = createBaseEditor({
      initialValue: value,
    });

    expect(editor.api.dom.isAutoScrolling()).toBe(false);
    expect(editor.read.view.isComposing()).toBe(false);
    expect(editor.read.view.isFocused()).toBe(false);
    expect(editor.read.view.isReadOnly()).toBe(false);

    const readOnlyEditor = createBaseEditor({
      readOnly: true,
      initialValue: value,
    });

    expect(readOnlyEditor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves host DOM focus API', () => {
    const focusSpy = spyOn(DOMEditor, 'focus').mockImplementation(() => {});
    const editor = createBaseEditor({
      initialValue: value,
    });
    editor.api.dom.focus({ retries: 1 });

    expect(focusSpy.mock.calls.at(-1)?.slice(1)).toEqual([{ retries: 1 }]);
  });
});
