import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import {
  createEditor,
  type Descendant,
  type Editor as EditorType,
} from '../src';

type LegacyOnChangeKey = Extract<keyof EditorType, 'onChange'>;

const editorHasNoOnChangeKey: LegacyOnChangeKey extends never ? true : never =
  true;

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('apply/onChange hard cuts', () => {
  void editorHasNoOnChangeKey;

  it('does not expose editor.onChange as an instance extension point', () => {
    const editor = createEditor();

    assert.equal('onChange' in editor, false);
    assert.equal((editor as Record<string, unknown>).onChange, undefined);
  });

  it('does not expose editor.apply as an instance extension point', () => {
    const editor = createEditor();

    assert.equal('apply' in editor, false);
    assert.equal((editor as Record<string, unknown>).apply, undefined);
  });

  it('imports operations through tx.operations.replay and publishes one commit', () => {
    const editor = createEditor();
    const commits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] = [];
    const unsubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });
    commits.length = 0;

    editor.update((tx) => {
      tx.operations.replay(
        [
          {
            type: 'insert_text',
            path: [0, 0],
            offset: 3,
            text: '!',
          },
        ],
        { tag: 'remote-import' }
      );
    });

    unsubscribe();

    assert.equal(Editor.string(editor, []), 'one!');
    assert.equal(commits.length, 1);
    assert.deepEqual(commits[0]?.tags, ['remote-import']);
    assert.deepEqual(
      commits[0]?.operations.map((operation) => operation.type),
      ['insert_text']
    );
  });

  it('uses commit listeners instead of onChange callback timing', () => {
    const editor = createEditor();
    const events: string[] = [];

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    const unsubscribeSubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) {
        events.push(`subscribe:${commit.operations.length}`);
      }
    });
    const unsubscribeCommit = Editor.registerCommitListener(
      editor,
      (commit) => {
        events.push(`commit:${commit.operations.length}`);
      }
    );

    editor.update((tx) => {
      tx.text.insert('!');
      tx.text.insert('?');
    });

    unsubscribeSubscribe();
    unsubscribeCommit();

    assert.deepEqual(events, ['commit:2', 'subscribe:2']);
  });
});
