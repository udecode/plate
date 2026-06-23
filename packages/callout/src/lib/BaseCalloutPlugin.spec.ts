import { createSlateEditor } from 'platejs';

import { BaseCalloutPlugin } from './BaseCalloutPlugin';
import { CALLOUT_STORAGE_KEY } from './transforms/calloutNode';

describe('BaseCalloutPlugin', () => {
  it('exposes callout break/delete rules and inserts bound callout nodes', () => {
    localStorage.setItem(CALLOUT_STORAGE_KEY, '🔥');

    const editor = createSlateEditor({
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

    editor.update((tx) => tx.callout.insert({ variant: 'info' }));

    expect(editor.children.at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: editor.getType('callout'),
      variant: 'info',
    });
  });

  it('exposes an inferred callout transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BaseCalloutPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update((tx) =>
      tx.callout.insert({ at: [1], icon: '📌', variant: 'warning' })
    );

    expect(editor.children.at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '📌',
      type: editor.getType('callout'),
      variant: 'warning',
    });
  });
});
