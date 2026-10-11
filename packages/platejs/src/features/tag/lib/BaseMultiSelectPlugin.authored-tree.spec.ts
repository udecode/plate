import { authoredTreeProof } from 'plitejs/authored';

import { createEditor } from '../../../core';
import { BaseMultiSelectPlugin } from './BaseMultiSelectPlugin';

// S2 of docs/plans/2026-10-10-authored-values.md: the duplicate correction
// skips a tag a pending suggestion deletes.

type Node = {
  authored?: Array<{ change: string }>;
  children?: Node[];
  type?: string;
  value?: string;
};

const make = () => {
  const proof = authoredTreeProof({
    authorId: 'alice',
    createChangeId: () => 'alice:1',
    intent: 'edit',
    now: () => 1,
  });
  const editor = createEditor({
    initialValue: [
      {
        children: [
          { text: '' },
          { children: [{ text: '' }], type: 'tag', value: 'alpha' },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ],
    plugins: [BaseMultiSelectPlugin, proof],
  });
  const { api } = editor.plugin(proof);

  api.propose('bob:1', () =>
    editor.update((tx) => tx.nodes.remove({ at: [0, 1] }))
  );

  return { api, editor };
};

type Run = ReturnType<typeof make>;

const pending = (nodes: readonly Node[]): string[] => [
  ...new Set(
    nodes.flatMap((node) => [
      ...(node.authored ?? []).map((mark) => mark.change),
      ...pending(node.children ?? []),
    ])
  ),
];
const changes = (run: Run) =>
  pending(run.editor.read.value().children as Node[]);
const tags = (run: Run) =>
  (run.editor.read.value().children as Node[])[0].children!.flatMap((node) =>
    node.type === 'tag' ? [node.value] : []
  );
const insertAlpha = (run: Run) =>
  run.editor.plugin(BaseMultiSelectPlugin).update.insert({ value: 'alpha' });
const decided = (action: 'accept' | 'reject', act: (run: Run) => void) => {
  const run = make();

  act(run);
  run.api.decide({ action, changes: changes(run) });

  return tags(run);
};

describe('tags beside a pending tag deletion', () => {
  it('keeps a suggested replacement with the struck tag value', () => {
    const suggest = (run: Run) =>
      run.api.propose('alice:1', () => insertAlpha(run));

    expect({
      accept: decided('accept', suggest),
      reject: decided('reject', suggest),
    }).toEqual({ accept: ['alpha'], reject: ['alpha'] });
  });

  it('keeps the pending deletion when Editing adds a tag with its value', () => {
    const run = make();

    insertAlpha(run);
    run.editor.update.value.repair();

    expect({
      accept: decided('accept', insertAlpha),
      pending: changes(run),
      reject: decided('reject', insertAlpha),
    }).toEqual({ accept: ['alpha'], pending: ['bob:1'], reject: ['alpha'] });
  });
});
