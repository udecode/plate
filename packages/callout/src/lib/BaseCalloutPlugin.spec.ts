import { createBaseEditor } from '@platejs/core';
import { schema } from '@platejs/plite';

import { BaseCalloutPlugin } from './BaseCalloutPlugin';

describe('BaseCalloutPlugin', () => {
  it('exposes callout break/delete rules and inserts bound callout nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const plugin = editor.plugin(BaseCalloutPlugin);
    const callout = schema.handle.element(
      BaseCalloutPlugin,
      editor.plugin(BaseCalloutPlugin).schema.type
    );
    const variant = schema.handle.property(callout, 'variant');

    expect(plugin.rules).toMatchObject({
      break: {
        default: 'lineBreak',
        empty: 'reset',
        emptyLineEnd: 'deleteExit',
      },
      delete: {
        start: 'reset',
      },
    });
    expect(editor.read.schema.property(variant)?.value.kind).toBe('string');
    expect(editor.read.schema.isElementTypeInGroup('callout', 'block')).toBe(
      true
    );

    editor.update.callout.insert({ variant: 'info' }, { at: [1] });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '💡',
      type: editor.plugin('callout').schema.type,
      variant: 'info',
    });
  });

  it('uses explicit insert properties and node options', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update((tx) => {
      tx.callout.insert({ icon: '🔥', variant: 'warning' }, { at: [1] });
    });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: 'callout',
      variant: 'warning',
    });
  });

  it('uses the default bulb icon when no icon is provided', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.callout.insert({}, { at: [1] });
    editor.update.callout.insert({ variant: 'info' }, { at: [2] });

    expect(
      editor.read.children().filter((node) => node.type === 'callout')
    ).toMatchObject([
      { icon: '💡', type: 'callout' },
      { icon: '💡', type: 'callout' },
    ]);
  });
});
