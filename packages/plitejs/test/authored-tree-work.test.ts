import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import * as marks from '../src/authored/tree/marks';
import { DocumentIndex } from '../src/core/change/document-index';
import * as tokens from '../src/core/change/tokens';

const real = { ...marks };
const realTokens = { ...tokens };
let markReads = 0;
let encodedTokens = 0;

mock.module(join(import.meta.dir, '../src/authored/tree/marks.ts'), () => ({
  ...real,
  readAuthoredMarks: (node: unknown) => {
    markReads += 1;

    return real.readAuthoredMarks(node);
  },
}));
mock.module(join(import.meta.dir, '../src/core/change/tokens.ts'), () => ({
  ...realTokens,
  encodeNodes: (nodes: Parameters<typeof tokens.encodeNodes>[0]) => {
    const encoded = realTokens.encodeNodes(nodes);

    encodedTokens += encoded.slice.tokens.length;

    return encoded;
  },
}));

const { createEditor, defineEditorSchema, property, schema, target } =
  await import('plitejs');
const { authoredTreeProof } = await import('../src/authored/tree/proof-plugin');

const Inline = defineEditorSchema('work-inline', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'work-inline',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

type Node = Record<string, unknown> & {
  children?: readonly Node[];
  text?: string;
};

const paragraph = (...children: Node[]) => ({ children, type: 'paragraph' });
const linked = () =>
  paragraph(
    { text: 'a ' },
    { children: [{ text: 'abc' }], type: 'link', url: 'u' },
    { text: ' b' }
  );

let count = 0;
const editorFor = (
  value: readonly Node[],
  intent: 'edit' | 'propose',
  author = 'alice'
) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      Inline,
      authoredTreeProof({
        authorId: author,
        createChangeId: () => `${author}:${(count += 1)}`,
        createTagId: () => `${author}-tag:${(count += 1)}`,
        intent,
        now: () => 1,
      }),
    ],
  });
type Editor = ReturnType<typeof editorFor>;

const blocks = (size: number, tail: readonly Node[]) => [
  ...Array.from({ length: size }, (_, index) =>
    paragraph({ text: `plain ${index}` })
  ),
  ...tail,
];

const quote = (size: number) => ({
  children: blocks(size, []),
  type: 'quote',
});
const twiceSplitLink = () => {
  const editor = editorFor([linked()], 'propose', 'bob');

  enter(editor, [0, 1, 0], 2);
  enter(editor, [0, 1, 0], 1);

  return editor.read.children() as readonly Node[];
};

const middlePieceOf = (first: number, run: number) => [first + run * 3 + 1, 1];

const enter = (editor: Editor, path: number[], offset: number) =>
  editor.update((tx) => {
    tx.selection.set({ anchor: { offset, path }, focus: { offset, path } });
    tx.break.insert();
  });
const splitLinks = [
  twiceSplitLink(),
  twiceSplitLink(),
  twiceSplitLink(),
].flat();

const workPerEdit = (editor: Editor, edit: (run: number) => void) => {
  const counts = [0, 1, 2].map((run) => {
    const before = { encodedTokens, markReads };

    edit(run);

    return {
      encodedTokens: encodedTokens - before.encodedTokens,
      markReads: markReads - before.markReads,
    };
  });

  // Equal zeros would only mean the counter never ran.
  if (counts.every((work) => work.markReads === 0)) {
    throw new Error('The read counter saw no reads.');
  }

  return counts;
};

const buildFirstIndexOutsideCount = (editor: Editor) => {
  const before = encodedTokens;

  DocumentIndex.fromValue(editor.read.children());
  if (encodedTokens === before) {
    throw new Error('The encode counter saw no first index.');
  }
};

const atBothSizes = (
  setup: (size: number) => Editor,
  edit: (editor: Editor, size: number, run: number) => void
) =>
  [100, 2000].map((size) => {
    const editor = setup(size);

    buildFirstIndexOutsideCount(editor);

    return workPerEdit(editor, (run) => edit(editor, size, run));
  });

const typeAtEnd = (editor: Editor, size: number) =>
  editor.update((tx) =>
    tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } })
  );

describe('authored review tree work per edit', () => {
  it('does as much work for Editing typing at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      typeAtEnd
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for Suggesting typing at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose'),
      typeAtEnd
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for a Suggesting bold toggle at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'propose'),
      (editor, size, run) =>
        editor.update((tx) => {
          const path = [size - 1, 0];

          tx.selection.set({
            anchor: { offset: 0, path },
            focus: { offset: 5, path },
          });
          if (run % 2 === 0) tx.marks.add('bold', true);
          else tx.marks.remove('bold');
        })
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for a Suggesting Enter inside a link at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) =>
        editorFor(blocks(size, [linked(), linked(), linked()]), 'propose'),
      (editor, size, run) => enter(editor, [size + 2 - run, 1, 0], 2)
    );

    assert.deepEqual(large, small);
  });

  it('does as much work for an Editing removal of a split link piece at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, splitLinks), 'edit'),
      (editor, size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: middlePieceOf(size, run) }))
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits the first and the last block at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [0, 0] } });
          tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that splits the first block and edits the last at 2,000 blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor(blocks(size, []), 'edit'),
      (editor, size) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [size - 1, 0] } });
          tx.nodes.split({ at: { offset: 1, path: [0, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits inside a long quote and splits the first block at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([paragraph({ text: 'abcdef' }), quote(size)], 'edit'),
      (editor, size, run) =>
        editor.update((tx) => {
          tx.text.insert('k', {
            at: { offset: 0, path: [1 + run, size - 1, 0] },
          });
          tx.nodes.split({ at: { offset: 1, path: [run, 0] } });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for one Editing transaction that edits inside a long quote and removes a split link piece after it at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([quote(size), ...splitLinks], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => {
          tx.text.insert('k', { at: { offset: 0, path: [0, 0, 0] } });
          tx.nodes.remove({ at: middlePieceOf(1, run) });
        })
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for Editing removals of the last piece of a split link, the first just before a long quote, at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([...splitLinks, quote(size)], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: [6 - run * 3 + 2] }))
    );

    assert.deepEqual(large, small);
  });
  it('does as much work for Editing removals of the first piece of a split link, the first just after a long quote, at 2,000 quoted blocks as at 100', () => {
    const [small, large] = atBothSizes(
      (size) => editorFor([quote(size), ...splitLinks], 'edit'),
      (editor, _size, run) =>
        editor.update((tx) => tx.nodes.remove({ at: [1 + run * 2] }))
    );

    assert.deepEqual(large, small);
  });
});
