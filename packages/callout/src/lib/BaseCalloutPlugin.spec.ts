import { createBaseEditor } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseCalloutPlugin } from './BaseCalloutPlugin';

describe('BaseCalloutPlugin', () => {
  it('exposes callout break/delete rules and inserts bound callout nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BaseCalloutPlugin);
    const callout = editor.read.schema.handle(BaseCalloutPlugin);
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

    editor.update.callout.insert({ variant: 'info' });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '💡',
      type: editor.getType('callout'),
      variant: 'info',
    });
  });

  it('uses explicit insert properties and node options', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update((tx) => {
      tx.callout.insert({
        at: [1],
        icon: '🔥',
        variant: 'warning',
      });
    });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: KEYS.callout,
      variant: 'warning',
    });
  });

  it('uses the default bulb icon when no icon is provided', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCalloutPlugin.configure({
          type: 'custom-callout',
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update.callout.insert();
    editor.update.callout.insert({ icon: undefined });

    expect(
      editor.read.children().filter((node) => node.type === 'custom-callout')
    ).toMatchObject([
      { icon: '💡', type: 'custom-callout' },
      { icon: '💡', type: 'custom-callout' },
    ]);
  });
});
