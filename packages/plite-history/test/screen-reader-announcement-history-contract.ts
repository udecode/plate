import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  screenReaderAnnouncementEffect,
} from '@platejs/plite';

import { history } from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('screen-reader announcement history policy', () => {
  it('does not store or replay announcements through undo and redo', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      tx.effects.emit(screenReaderAnnouncementEffect, 'Inserted punctuation');
    });

    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.effects),
      []
    );

    editor.update((tx) => tx.history.undo());

    assert.equal(
      editor.read
        .lastCommit()
        ?.effects.some(
          (effect) => effect.type === screenReaderAnnouncementEffect
        ),
      false
    );

    editor.update((tx) => tx.history.redo());

    assert.equal(
      editor.read
        .lastCommit()
        ?.effects.some(
          (effect) => effect.type === screenReaderAnnouncementEffect
        ),
      false
    );
  });
});
