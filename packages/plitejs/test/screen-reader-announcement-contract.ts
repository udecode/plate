import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type EditorCommit,
  screenReaderAnnouncementEffect,
} from 'plitejs';

import { getScreenReaderAnnouncements } from '../src/core/screen-reader-announcement';

describe('screen-reader announcement effect', () => {
  it('publishes localized text on one headless transaction commit', () => {
    const editor = createEditor();
    const commits: EditorCommit[] = [];

    editor.subscribeCommit((commit) => {
      commits.push(commit);
    });

    editor.update((tx) => {
      tx.effects.emit(screenReaderAnnouncementEffect, 'Block moved up');
    });

    const commit = editor.read.lastCommit();

    assert.equal(screenReaderAnnouncementEffect.collab, 'local');
    assert.equal(screenReaderAnnouncementEffect.history, 'skip');
    assert.equal(commits.length, 1);
    assert.deepEqual(getScreenReaderAnnouncements(commit?.effects ?? []), [
      'Block moved up',
    ]);
    assert.equal(commit?.changes.empty, true);
  });

  it('preserves repeated and ordered messages within the emitting commit', () => {
    const editor = createEditor();

    editor.update((tx) => {
      tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
      tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
    });

    assert.deepEqual(
      getScreenReaderAnnouncements(editor.read.lastCommit()?.effects ?? []),
      ['Saved', 'Saved']
    );
  });
});
