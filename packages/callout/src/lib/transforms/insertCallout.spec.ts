import { createSlateEditor, KEYS } from 'platejs';

import { BaseCalloutPlugin } from '../BaseCalloutPlugin';
import { CALLOUT_STORAGE_KEY, insertCallout } from './insertCallout';

describe('insertCallout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the explicit icon, variant, and passed insert options', () => {
    const editor = createSlateEditor({
      plugins: [BaseCalloutPlugin],
      value: [
        { children: [{ text: 'before' }], type: KEYS.p },
        { children: [{ text: 'after' }], type: KEYS.p },
      ],
    });

    insertCallout(editor, { at: [1], icon: '🔥', variant: 'warning' });

    expect(editor.children[1]).toMatchObject({
      children: [{ text: '' }],
      icon: '🔥',
      type: KEYS.callout,
      variant: 'warning',
    });
  });

  it('falls back to local storage and then the default bulb icon', () => {
    const editor = createSlateEditor({
      plugins: [BaseCalloutPlugin],
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    localStorage.setItem(CALLOUT_STORAGE_KEY, '📌');
    insertCallout(editor);
    insertCallout(editor, { icon: undefined });
    localStorage.removeItem(CALLOUT_STORAGE_KEY);
    insertCallout(editor);

    expect(editor.children[1]).toMatchObject({
      icon: '📌',
      type: KEYS.callout,
    });
    expect(editor.children[3]).toMatchObject({
      icon: '💡',
      type: KEYS.callout,
    });
  });
});
