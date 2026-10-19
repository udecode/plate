import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  type Element,
  schema,
  SelectionApi,
} from '../../src';
import { history } from '../../src/history';
import { getDefined } from '../../src/internal/get-defined';
import { defineTestSchema } from '../support/schema';

const JoinSchema = defineTestSchema('join-replay', {
  heading: {
    content: schema.content.any([
      schema.content.text(),
      schema.content.group('inline'),
    ]),
  },
});

const t = (text: string, props: Record<string, unknown> = {}) => ({
  text,
  ...props,
});
const element =
  (type: string) =>
  (...children: Descendant[]): Element => ({ children, type });
const h = element('heading');
const p = element('paragraph');
const bold = { bold: true };

const selectIn = (path: number[], from: number, to: number) =>
  SelectionApi.text({
    anchor: { offset: from, path },
    focus: { offset: to, path },
  });

const editorFor = (children: readonly Element[]) =>
  createEditor({
    initialValue: structuredClone(children),
    plugins: [JoinSchema, history()],
  });

const undosOverJoin = (
  children: readonly Element[],
  edit: (editor: ReturnType<typeof editorFor>) => void,
  undos: number
) => {
  const editor = editorFor(children);

  edit(editor);

  const peer = createEditor({
    initialValue: structuredClone(editor.read.children()),
    plugins: [JoinSchema],
  });

  peer.update((tx) => tx.nodes.merge({ at: [1] }));
  editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
    tx.changes.apply(getDefined(peer.read.lastCommit()).changes);
  });

  return Array.from({ length: undos }, () => ({
    status: editor.api.history.undo().status,
    tree: editor.read.children(),
  }));
};

const applied = (...trees: Element[][]) =>
  trees.map((tree) => ({ status: 'applied', tree }));

describe('undo with formatting over a peer’s join', () => {
  it('restores a line break and a mark in one undo, keeping the join', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('ab', bold), t('X')), p(t('Y')), p(t('cd'))],
        (editor) => {
          editor.update((tx) => {
            tx.text.delete({
              at: {
                anchor: { offset: 0, path: [0, 1] },
                focus: { offset: 1, path: [1, 0] },
              },
            });
            tx.selection.set(selectIn([0, 0], 1, 2));
            tx.marks.remove('bold');
          });
        },
        1
      ),
      applied([h(t('ab', bold), t('Xcd')), p(t('Y'))])
    );
  });

  it('undoes a deletion across lines made before a mark, keeping the join', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('abX')), p(t('Y')), p(t('cd'))],
        (editor) => {
          editor.update((tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 2, path: [0, 0] },
                focus: { offset: 1, path: [1, 0] },
              },
            })
          );
          editor.update({ history: 'new-batch' }, (tx) => {
            tx.selection.set(selectIn([0, 0], 0, 1));
            tx.marks.add('bold', true);
          });
        },
        2
      ),
      applied([h(t('abcd'))], [h(t('abXcd')), p(t('Y'))])
    );
  });

  it('undoes typing inside a removed line the join moved, when the removal also set a mark', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('ab')), p(t('Y')), p(t('cd'))],
        (editor) => {
          editor.update((tx) =>
            tx.text.insert('X', { at: { offset: 0, path: [1, 0] } })
          );
          editor.update({ history: 'new-batch' }, (tx) => {
            tx.selection.set(selectIn([0, 0], 1, 2));
            tx.marks.add('bold', true);
            tx.nodes.remove({ at: [1] });
          });
        },
        2
      ),
      applied([h(t('abcd')), p(t('XY'))], [h(t('abcd')), p(t('Y'))])
    );
  });
});
