import { KEYS } from 'platejs';

import { CALLOUT_STORAGE_KEY, insertCallout } from './insertCallout';

describe('insertCallout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the explicit icon, variant, and passed insert options', () => {
    const editor = {
      getType: mock(() => KEYS.callout),
      tf: { insertNodes: mock() },
    } as any;

    insertCallout(editor, { at: [1], icon: '🔥', variant: 'warning' } as any);

    expect(editor.tf.insertNodes).toHaveBeenCalledWith(
      {
        children: [{ text: '' }],
        icon: '🔥',
        type: KEYS.callout,
        variant: 'warning',
      },
      { at: [1] }
    );
  });

  it('falls back to local storage and then the default bulb icon', () => {
    const editor = {
      getType: mock(() => 'custom-callout'),
      tf: { insertNodes: mock() },
    } as any;

    localStorage.setItem(CALLOUT_STORAGE_KEY, '📌');
    insertCallout(editor);
    insertCallout(editor, { icon: undefined } as any);
    localStorage.removeItem(CALLOUT_STORAGE_KEY);
    insertCallout(editor);

    expect(editor.tf.insertNodes.mock.calls[0]?.[0]).toMatchObject({
      icon: '📌',
      type: 'custom-callout',
    });
    expect(editor.tf.insertNodes.mock.calls[2]?.[0]).toMatchObject({
      icon: '💡',
      type: 'custom-callout',
    });
  });
});
