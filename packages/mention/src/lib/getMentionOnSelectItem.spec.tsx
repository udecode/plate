import { KEYS } from 'platejs';

import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseMentionPlugin } from './BaseMentionPlugin';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';

describe('getMentionOnSelectItem', () => {
  it('inserts a trailing space when the mention lands at block end', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'p' }],
      plugins: [MentionPlugin],
    });

    getMentionOnSelectItem()(editor as never, { key: 'u1', text: 'Ada' }, 'ad');

    const children = editor.read((state) => state.value.root())[0].children;

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
      plugins: [MentionPlugin],
    });

    getMentionOnSelectItem()(editor as never, { key: 'u1', text: 'Ada' }, 'ad');

    const children = editor.read((state) => state.value.root())[0].children;

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
