import { createSlateEditor, KEYS } from 'platejs';

import { BaseMentionPlugin } from './BaseMentionPlugin';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';

describe('getMentionOnSelectItem', () => {
  it('inserts a trailing space when the mention lands at block end', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createSlateEditor({
      plugins: [MentionPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hi' }], type: 'p' }],
    } as any);

    getMentionOnSelectItem()(editor, { key: 'u1', text: 'Ada' } as any, 'ad');

    const children = (editor.children[0] as any).children;

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.selection).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createSlateEditor({
      plugins: [MentionPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    } as any);

    getMentionOnSelectItem()(editor, { key: 'u1', text: 'Ada' } as any, 'ad');

    const children = (editor.children[0] as any).children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });
});
