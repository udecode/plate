import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  type Element,
  type Editor as EditorType,
} from '@platejs/plite';
import {
  type getLastCommit as editorGetLastCommit,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

type LegacyOnChangeKey = Extract<keyof EditorType, 'onChange'>;

const editorHasNoOnChangeKey: LegacyOnChangeKey extends never ? true : never =
  true;

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('apply/onChange hard cuts', () => {
  void editorHasNoOnChangeKey;

  it('does not expose editor.onChange as an instance extension point', () => {
    const editor = createEditor();

    assert.equal('onChange' in editor, false);
    assert.equal(
      (editor as unknown as Record<string, unknown>).onChange,
      undefined
    );
  });

  it('does not expose editor.apply as an instance extension point', () => {
    const editor = createEditor();

    assert.equal('apply' in editor, false);
    assert.equal(
      (editor as unknown as Record<string, unknown>).apply,
      undefined
    );
  });

  it('publishes one tagged commit for a transaction', () => {
    const editor = createEditor();
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];
    const unsubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    commits.length = 0;

    editor.update((tx) => {
      tx.tags.add('remote-import');
      tx.text.insert('!');
    });

    unsubscribe();

    assert.equal(editorString(editor, []), 'one!');
    assert.equal(commits.length, 1);
    assert.deepEqual(commits[0]?.tags, ['remote-import']);
    assert.equal(commits[0]?.changed.has('text'), true);
  });

  it('uses commit listeners instead of onChange callback timing', () => {
    const events: string[] = [];
    const editor = createEditor({
      extensions: [
        defineExtension('commit-timing-listener', {
          on: {
            commit({ commit }) {
              events.push(`commit:${commit.changed.has('text')}`);
            },
          },
        }),
      ] as const,
    });

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    events.length = 0;

    const unsubscribeSubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) {
        events.push(`subscribe:${commit.changed.has('text')}`);
      }
    });
    editor.update((tx) => {
      tx.text.insert('!');
      tx.text.insert('?');
    });

    unsubscribeSubscribe();

    assert.deepEqual(events, ['commit:true', 'subscribe:true']);
  });
});
