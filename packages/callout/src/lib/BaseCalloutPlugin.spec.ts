import { createSlateEditor } from 'platejs';

import { BaseCalloutPlugin } from './BaseCalloutPlugin';
import { CALLOUT_STORAGE_KEY } from './transforms/insertCallout';

describe('BaseCalloutPlugin', () => {
  it('exposes callout break/delete rules and inserts bound callout nodes', () => {
    localStorage.setItem(CALLOUT_STORAGE_KEY, '🔥');

    const editor = createSlateEditor({
      plugins: [BaseCalloutPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);
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

    (editor.tf.insert as any).callout({ variant: 'info' });

    expect(editor.children.at(-1)).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: editor.getType('callout'),
      variant: 'info',
    });
  });
});
