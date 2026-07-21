import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseMentionPlugin } from './BaseMentionPlugin';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';

describe('getMentionOnSelectItem', () => {
  it('inserts a trailing space when the mention lands at block end', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hi' }], type: 'p' }],
    });

    getMentionOnSelectItem()(editor, { key: 'u1', text: 'Ada' }, 'ad');

    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);
    const children = entry[0].children;

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      options: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    getMentionOnSelectItem()(editor, { key: 'u1', text: 'Ada' }, 'ad');

    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);
    const children = entry[0].children;

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
