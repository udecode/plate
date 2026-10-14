import { createAuthoredPlugin } from 'plitejs/authored';

import { createEditor } from '../../../core';
import { BaseFindPlugin } from './BaseFindPlugin';

const struck = { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' };

describe('find beside a struck block', () => {
  it('selects the match where the search found it', () => {
    const editor = createEditor({
      initialValue: [
        {
          authored: [struck],
          children: [{ authored: [struck], text: 'gone' }],
          type: 'paragraph',
        },
        { children: [{ text: 'hello' }], type: 'paragraph' },
      ] as never,
      plugins: [
        BaseFindPlugin,
        createAuthoredPlugin({
          authorId: 'alice',
          createChangeId: () => 'alice:1',
          intent: 'edit',
          now: () => 1,
        }),
      ],
    });
    const { api, store, update } = editor.plugin(BaseFindPlugin);

    api.search('hello');

    expect(update.select()).toBe(true);
    expect(editor.read.selection()).toEqual(store.get('activeMatch')?.range);
  });
});
