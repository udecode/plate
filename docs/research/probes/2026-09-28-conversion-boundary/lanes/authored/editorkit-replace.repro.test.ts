// Lane authored repro: `value.replace` on the registry EditorKit editor
// (authored through AIKit's DefaultAuthoredPlugin) with Markdown whose last
// block makes TrailingBlockPlugin insert a paragraph during the replacement's
// correction pass. Run from the repository root:
//   bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/authored/editorkit-replace.repro.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'platejs';

import { EditorKit } from '../../../../../../apps/www/src/registry/components/editor/plugins';

const createKitEditor = () =>
  createEditor({
    plugins: EditorKit,
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });

const parse = (editor: ReturnType<typeof createKitEditor>, markdown: string) => {
  const result = editor.api.markdown.parse(markdown);

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Markdown parse failed.');

  return result.document;
};

const cases = [
  {
    name: 'table',
    markdown: 'intro\n\n| a | b |\n| - | - |\n| 1 | 2 |',
    lastType: 'table',
  },
  {
    name: 'columnGroup',
    markdown:
      'intro\n\n<columnGroup>\n<column width="50%">\nleft\n</column>\n\n<column width="50%">\nright\n</column>\n</columnGroup>',
    lastType: 'columnGroup',
  },
] as const;

describe('EditorKit value.replace with a trailing-block correction', () => {
  for (const { lastType, markdown, name } of cases) {
    it(`loads Markdown ending in a ${name} and folds the trailing block into the load`, () => {
      const editor = createKitEditor();
      const document = parse(editor, markdown);
      let commits = 0;
      editor.subscribeCommit(() => {
        commits += 1;
      });

      editor.update.value.replace(document);

      const children = editor.read.value().children as readonly {
        type?: string;
      }[];
      assert.equal(commits, 1);
      assert.equal(children.at(-2)?.type, lastType);
      assert.equal(children.at(-1)?.type, 'paragraph');
      assert.equal(children.length, document.children.length + 1);
      assert.equal(editor.read.history().undos.length, 0);
    });

    it(`loads the ${name} document through a nested update callback`, () => {
      const editor = createKitEditor();
      const document = parse(editor, markdown);

      editor.update((tx) => {
        tx.value.replace(document);
      });

      const children = editor.read.value().children as readonly {
        type?: string;
      }[];
      assert.equal(children.at(-2)?.type, lastType);
      assert.equal(children.at(-1)?.type, 'paragraph');
    });
  }

  it('still rejects an ordinary write after the replacement', () => {
    const editor = createKitEditor();
    const document = parse(editor, cases[0].markdown);
    const before = editor.read.value();

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.value.replace(document);
          tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
        }),
      /Document replacement cannot mix with ordinary writes\./
    );
    assert.deepEqual(editor.read.value(), before);
  });
});
