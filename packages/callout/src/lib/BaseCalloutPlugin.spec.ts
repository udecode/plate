import { createBaseEditor } from '@platejs/core';

import { BaseCalloutPlugin } from './BaseCalloutPlugin';
import { CALLOUT_STORAGE_KEY } from './transforms/insertCallout';

describe('BaseCalloutPlugin', () => {
  it('exposes callout break/delete rules and inserts bound callout nodes', () => {
    localStorage.setItem(CALLOUT_STORAGE_KEY, '🔥');

    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BaseCalloutPlugin);

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
    expect(
      editor.read.schema.property({
        key: 'variant',
        placement: 'element',
        type: 'callout',
      })?.value.kind
    ).toBe('string');
    expect(editor.read.schema.isElementTypeInGroup('callout', 'block')).toBe(
      true
    );

    editor.update.callout.insert({ variant: 'info' });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: editor.getType('callout'),
      variant: 'info',
    });
  });
});
