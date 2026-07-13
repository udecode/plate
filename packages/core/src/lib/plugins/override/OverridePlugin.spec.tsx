import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';

describe('OverridePlugin', () => {
  it('selects a previous block void before deleting it', () => {
    const VoidPlugin = createBasePlugin({
      key: 'void',
      node: { isElement: true, isVoid: true },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    editor.update((tx) => tx.text.deleteBackward({ unit: 'character' }));

    expect(editor.read.value().children).toEqual([
      { children: [{ text: '' }], type: 'void' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('removes a selected block void without merging the next block into it', () => {
    const VoidPlugin = createBasePlugin({
      key: 'void',
      node: { isElement: true, isVoid: true },
    });
    const editor = createBaseEditor({
      plugins: [VoidPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    editor.update((tx) => tx.text.deleteForward({ unit: 'character' }));

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('handles deleteExit through the OverridePlugin Plite extension', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: {
        break: {
          emptyLineEnd: 'deleteExit',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'foo\n' }], type: 'callout' }],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'foo' }], type: 'callout' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('preserves an empty merge target when its plugin disables removal', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: { merge: { removeEmpty: false } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    editor.update((tx) => tx.text.deleteBackward({ unit: 'character' }));

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('preserves plugin-owned empty merge targets by default', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
    });
    const MergeAwarePlugin = createBasePlugin({
      key: 'merge-aware',
      rules: { merge: { removeEmpty: true } },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, MergeAwarePlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    editor.update((tx) => tx.text.deleteBackward({ unit: 'character' }));

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });
});
