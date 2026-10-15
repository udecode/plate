import { createAuthoredPlugin } from 'plitejs/authored';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { createEditor } from '../../../core';
import { BaseDetailsPlugin } from './BaseDetailsPlugin';

const details = (title: unknown, body = 'Body') => [
  {
    children: [
      { children: [title], type: 'summary' },
      { children: [{ text: body }], type: 'paragraph' },
    ],
    type: 'details',
  },
];

const make = (initialValue: unknown[] = details({ text: 'Title' })) => {
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

describe('details beside a pending title deletion', () => {
  it('strikes the title text, and accepting leaves an empty title', () => {
    const decided = (action: 'accept' | 'reject') => {
      const run = make();

      run.api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0, 0] }));
      const proposed = run.editor.read.children();

      run.editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 4, path: [0, 1, 0] } });
      });
      run.api.decide({ action, changes: ['bob:1'] });

      return { decided: run.editor.read.children(), proposed };
    };
    const struck = {
      authored: [{ at: 1, author: 'alice', change: 'bob:1', kind: 'delete' }],
      text: 'Title',
    };

    expect({
      accept: decided('accept'),
      reject: decided('reject'),
    }).toEqual({
      accept: {
        decided: details({ text: '' }, 'Body!'),
        proposed: details(struck),
      },
      reject: {
        decided: details({ text: 'Title' }, 'Body!'),
        proposed: details(struck),
      },
    });
  });

  it('removes a whole details whose removal is accepted after a repair runs', () => {
    const start = () => [
      ...details({ text: 'Title' }),
      { children: [{ text: 'After' }], type: 'paragraph' },
    ];
    const editing = make(start());
    const run = make(start());

    editing.editor.update((tx) => tx.nodes.remove({ at: [0] }));
    run.api.propose('bob:1', (tx) => tx.nodes.remove({ at: [0] }));
    run.editor.update.value.repair();
    run.api.decide({ action: 'accept', changes: ['bob:1'] });

    expect(run.editor.read.children()).toEqual(editing.editor.read.children());
  });
});
