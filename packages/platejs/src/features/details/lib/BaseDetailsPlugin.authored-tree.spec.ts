import { createAuthoredPlugin } from 'plitejs/authored';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';

import { createEditor } from '../../../core';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

// S2 of docs/plans/2026-10-10-authored-values.md: the details correction skips
// a summary a pending suggestion deletes.

type Node = { children?: Node[]; text?: string; type?: string };

const value = (body = 'Body') => [
  {
    children: [
      { children: [{ text: 'Title' }], type: 'summary' },
      { children: [{ text: body }], type: 'paragraph' },
    ],
    type: 'details',
  },
];

const make = () => {
  const proof = createAuthoredPlugin({
    authorId: 'alice',
    createChangeId: () => 'alice:1',
    intent: 'edit',
    now: () => 1,
  });
  const editor = createEditor({
    initialValue: value(),
    plugins: [BaseDetailsPlugin, proof],
  });

  return { api: authoredTestApi(editor), editor };
};

type Editor = ReturnType<typeof make>['editor'];

const shape = (nodes: readonly Node[]): unknown[] =>
  nodes.map((node) =>
    node.children ? { [node.type!]: shape(node.children) } : node.text
  );
const removeSummary = (editor: Editor) =>
  editor.update((tx) => tx.nodes.remove({ at: [0, 0] }));
const typeInBody = (editor: Editor) =>
  editor.update((tx) => {
    const [, path] = tx.nodes.find({
      at: [],
      match: (node) => 'text' in node && node.text === 'Body',
    })!;

    tx.text.insert('!', { at: { offset: 4, path } });
  });

describe('details beside a pending summary deletion', () => {
  it('keeps the suggested summary when Editing types in the body', () => {
    const editing = make();
    const decided = (action: 'accept' | 'reject') => {
      const run = make();

      run.api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0, 0] }));
      typeInBody(run.editor);
      run.api.decide({ action, changes: ['bob:1'] });

      return shape(run.editor.read.children() as Node[]);
    };

    removeSummary(editing.editor);
    typeInBody(editing.editor);

    expect({
      accept: decided('accept'),
      reject: decided('reject'),
    }).toEqual({
      accept: shape(editing.editor.read.children() as Node[]),
      reject: shape(value('Body!')),
    });
  });
  it('moves a live summary first past one a pending suggestion deletes, as Editing does', () => {
    const struck = [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }];
    const details = (children: unknown[]) => [{ children, type: 'details' }];
    const summary = { children: [{ text: 'Second' }], type: 'summary' };
    const body = { children: [{ text: 'Body' }], type: 'paragraph' };
    const editorOf = (initialValue: unknown[]) => {
      const proof = createAuthoredPlugin({
        authorId: 'alice',
        createChangeId: () => 'alice:1',
        intent: 'edit',
        now: () => 1,
      });
      const editor = createEditor({
        initialValue: initialValue as never,
        plugins: [BaseDetailsPlugin, proof],
      });

      return { api: authoredTestApi(editor), editor };
    };
    const editing = editorOf(details([body, summary]));
    const run = editorOf(
      details([
        {
          authored: struck,
          children: [{ authored: struck, text: 'Title' }],
          type: 'summary',
        },
        body,
        summary,
      ])
    );

    typeInBody(editing.editor);
    typeInBody(run.editor);
    run.api.decide({ action: 'accept', changes: ['bob:1'] });

    expect(shape(run.editor.read.children() as Node[])).toEqual(
      shape(editing.editor.read.children() as Node[])
    );
  });

  it('removes a whole details whose removal is accepted after a repair runs', () => {
    const start = () => [
      ...value(),
      { children: [{ text: 'After' }], type: 'paragraph' },
    ];
    const editorOf = () => {
      const proof = createAuthoredPlugin({
        authorId: 'alice',
        createChangeId: () => 'alice:1',
        intent: 'edit',
        now: () => 1,
      });
      const editor = createEditor({
        initialValue: start(),
        plugins: [BaseDetailsPlugin, proof],
      });

      return { api: authoredTestApi(editor), editor };
    };
    const editing = editorOf();
    const run = editorOf();

    editing.editor.update((tx) => tx.nodes.remove({ at: [0] }));
    run.api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0] }));
    run.editor.update.value.repair();
    run.api.decide({ action: 'accept', changes: ['bob:1'] });

    expect(shape(run.editor.read.children() as Node[])).toEqual(
      shape(editing.editor.read.children() as Node[])
    );
  });
});
