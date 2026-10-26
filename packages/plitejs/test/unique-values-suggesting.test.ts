import assert from 'node:assert/strict';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  type Editor,
  property,
  schema,
  target,
  type Value as EditorValue,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import * as refusal from '../src/authored/refusal';
import { authoredTestApi } from './support/authored';

const real = { ...refusal };
// Suggesting stays off under any element generator until the construction
// values plan's step 10 narrows the refusal, so these tests lift it to reach
// the recorder that step will open.
let lifted = false;

mock.module(join(import.meta.dir, '../src/authored/refusal.ts'), () => ({
  ...real,
  constructsValues: (...args: Parameters<typeof real.constructsValues>) =>
    !lifted && real.constructsValues(...args),
}));

afterEach(() => {
  lifted = false;
});

type Node = Readonly<{
  authored?: readonly unknown[];
  children?: readonly Node[];
  id?: string;
  text?: string;
  type?: string;
}>;
type TestEditor = Editor<EditorValue, readonly unknown[]>;

const c = schema.content;
let made = 0;
const Ids = defineEditorSchema('schema:unique-values-suggesting', {
  elements: {
    link: {
      content: c.text({ default: 'text', min: 1 }),
      inline: true,
    },
    paragraph: schema.element.textBlock(),
    quote: { content: c.type('paragraph', { min: 1 }) },
  },
  id: 'unique-values-suggesting',
  properties: [
    schema.elementProperty(
      'id',
      property.string({ generate: () => `g${(made += 1)}` }),
      {
        role: 'metadata',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
        unique: true,
      }
    ),
  ],
  root: c.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const p = (text: string, id: string): Node => ({
  children: [{ text }],
  id,
  type: 'paragraph',
});
const linked = (text: string, linkId: string, id: string): Node => ({
  children: [
    { text: '' },
    { children: [{ text }], id: linkId, type: 'link' },
    { text: '' },
  ],
  id,
  type: 'paragraph',
});
const editorOf = (
  children: readonly Node[],
  author: string,
  intent: 'edit' | 'propose'
): TestEditor => {
  let count = 0;

  return createEditor<EditorValue, readonly unknown[]>({
    initialValue: structuredClone({ children }) as never,
    plugins: [
      Ids,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => `${author}:${(count += 1)}`,
        intent,
        now: () => 1,
      }),
    ] as never,
  });
};
const blocks = (editor: TestEditor) =>
  editor.read.value().children as readonly Node[];
const suggested = (
  children: readonly Node[],
  author: string,
  run: (tx: any) => void
) => {
  const editor = editorOf(children, author, 'propose');

  editor.update(run);

  return blocks(editor);
};

describe('a unique generated property under Suggesting', () => {
  it('stores a new id on a kept block in place, with no format tag', () => {
    lifted = true;

    assert.deepEqual(
      suggested([p('a', 'a'), p('b', 'b')], 'alice', (tx) => {
        tx.nodes.set({ id: 'z' }, { at: [0] });
      }),
      [p('a', 'z'), p('b', 'b')]
    );
  });

  it('gives the right half of a rejected cut the id of the left half whose text a decision deleted, in either order', () => {
    lifted = true;

    const entered = suggested([linked('ab', 'l', 'x')], 'alice', (tx) => {
      const at = { offset: 1, path: [0, 1, 0] };

      tx.selection.set({ anchor: at, focus: at });
      tx.break.insert();
    });
    const pending = suggested(entered, 'bob', (tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 1, path: [0, 1, 0] },
        },
      });
    });
    const decided = (
      steps: ReadonlyArray<
        ReadonlyArray<Readonly<{ action: 'accept' | 'reject'; change: string }>>
      >
    ) => {
      let current = pending;
      const waiting: Array<(typeof steps)[number][number]> = [];

      // A decision the resolver holds until another is taken goes with it.
      for (const step of steps) {
        const editor = editorOf(current, 'zed', 'edit');

        waiting.push(...step);
        if (
          authoredTestApi(editor).decide(
            waiting.map(({ action, change }) => ({ action, changes: [change] }))
          ).status === 'blocked'
        ) {
          continue;
        }
        waiting.length = 0;
        current = blocks(editor);
      }

      return { current, waiting: waiting.length };
    };
    const removal = { action: 'accept', change: 'bob:1' } as const;
    const enter = { action: 'reject', change: 'alice:1' } as const;
    const together = decided([[removal, enter]]);

    assert.deepEqual(
      {
        enterFirst: decided([[enter], [removal]]),
        removalFirst: decided([[removal], [enter]]),
      },
      { enterFirst: together, removalFirst: together }
    );
    assert.deepEqual(together, {
      current: [linked('b', 'l', 'x')],
      waiting: 0,
    });
  });

  it('gives the right half of a rejected cut the id of the left half Editing removed', () => {
    lifted = true;

    const entered = suggested([linked('ab', 'l', 'x')], 'alice', (tx) => {
      const at = { offset: 1, path: [0, 1, 0] };

      tx.selection.set({ anchor: at, focus: at });
      tx.break.insert();
    });
    const editing = editorOf(entered, 'eve', 'edit');

    editing.update((tx) => tx.nodes.remove({ at: [0, 1] }));

    const reviewer = editorOf(blocks(editing), 'zed', 'edit');

    authoredTestApi(reviewer).decide({
      action: 'reject',
      changes: ['alice:1'],
    });

    assert.deepEqual(blocks(reviewer), [linked('b', 'l', 'x')]);
  });
});
