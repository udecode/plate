import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseCalloutPlugin } from '../BaseCalloutPlugin';
import { CALLOUT_STORAGE_KEY, insertCallout } from './insertCallout';

describe('insertCallout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the explicit icon, variant, and passed insert options', () => {
    const editor = createBaseEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update((tx) => {
      insertCallout(tx, editor.getType(KEYS.callout), {
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

  it('falls back to local storage and then the default bulb icon', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCalloutPlugin.configure({
          type: 'custom-callout',
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    localStorage.setItem(CALLOUT_STORAGE_KEY, '📌');
    editor.update.callout.insert();
    editor.update.callout.insert({ icon: undefined });
    localStorage.removeItem(CALLOUT_STORAGE_KEY);
    editor.update.callout.insert();

    expect(editor.read.children().at(1)).toMatchObject({
      icon: '📌',
      type: 'custom-callout',
    });
    expect(editor.read.children().at(3)).toMatchObject({
      icon: '💡',
      type: 'custom-callout',
    });
  });
});
