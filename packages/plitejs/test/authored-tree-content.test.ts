import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, NodeApi } from 'plitejs';

import { authoredTreeProof } from '../src/authored/tree/proof-plugin';

const struck = (text: string) => ({
  authored: [{ at: 1, author: 'alice', change: 'alice:1', kind: 'delete' }],
  text,
});
const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
});
const editorWith = (...children: Array<Record<string, unknown>>) =>
  createEditor({
    plugins: [authoredTreeProof({ authorId: 'bob' })],
    initialValue: [paragraph(...children)],
  });

describe('authored review tree content reads', () => {
  it('steps a word by content over struck text inside it, in both directions', () => {
    const editor = editorWith({ text: 'hel' }, struck('lo '), {
      text: 'world',
    });

    assert.deepEqual(
      editor.read.points.after(
        { offset: 0, path: [0, 0] },
        { content: true, unit: 'word' }
      ),
      { offset: 5, path: [0, 2] }
    );
    assert.deepEqual(
      editor.read.points.before(
        { offset: 5, path: [0, 2] },
        { content: true, unit: 'word' }
      ),
      { offset: 0, path: [0, 0] }
    );
  });

  it('reads the character after the caret past struck text when an input rule steps and reads by content', () => {
    const editor = editorWith({ text: 'a' }, struck('XY'), { text: 'b' });
    const caret = { offset: 1, path: [0, 0] };
    const after = editor.read.points.after(caret, {
      content: true,
      distance: 1,
      unit: 'character',
    });

    assert.ok(after);
    assert.equal(
      editor.read.text.string(
        { anchor: caret, focus: after },
        { content: true }
      ),
      'b'
    );
  });

  it('reads an input rule match by content when struck text sits inside it', () => {
    const editor = editorWith({ text: '**bo' }, struck('XX'), { text: 'ld' });
    const caret = { offset: 2, path: [0, 2] };
    const start = editor.read.points.before(caret, {
      afterMatch: true,
      content: true,
      matchString: '**',
      skipInvalid: true,
    });

    assert.ok(start);
    assert.equal(
      editor.read.text.string(
        { anchor: start, focus: caret },
        { content: true }
      ),
      'bold'
    );
  });

  it('reads the character before a mention trigger past struck text', () => {
    const editor = editorWith({ text: 'foo ' }, struck('bar'), { text: '@' });
    const trigger = { offset: 0, path: [0, 2] };
    const before = editor.read.points.before(trigger, {
      content: true,
      distance: 1,
      unit: 'character',
    });

    assert.ok(before);
    assert.equal(
      editor.read.text.string(
        { anchor: before, focus: trigger },
        { content: true }
      ),
      ' '
    );
  });

  it('finds content text across struck text and never inside it', () => {
    const editor = editorWith({ text: 'keep ' }, struck('gone '), {
      text: 'NEW tail',
    });

    assert.deepEqual(
      NodeApi.findTextRanges(editor, 'keep NEW', { content: true }),
      [
        {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 2] },
        },
      ]
    );
    assert.deepEqual(
      NodeApi.findTextRanges(editor, 'gone', { content: true }),
      []
    );
  });
});
