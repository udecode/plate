import type { Descendant } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeInsertFragment } from './pipeInsertFragment';

const createParserEditor = (
  plugins: Parameters<typeof createBaseEditor>[0]['plugins']
) => createBaseEditor({ plugins });

describe('pipeInsertFragment', () => {
  it('stops at the first preInsert handler returning true and still inserts the fragment', () => {
    const calls: string[] = [];

    const firstPlugin = createBasePlugin({
      key: 'first',
      parser: {
        preInsert: ({ fragment }) => {
          calls.push(`first:${fragment.length}`);
          return false;
        },
      },
    });

    const secondPlugin = createBasePlugin({
      key: 'second',
      parser: {
        preInsert: ({ fragment }) => {
          calls.push(`second:${fragment.length}`);
          return true;
        },
      },
    });

    const thirdPlugin = createBasePlugin({
      key: 'third',
      parser: {
        preInsert: () => {
          calls.push('third');
          return false;
        },
      },
    });

    const editor = createParserEditor([firstPlugin, secondPlugin, thirdPlugin]);

    const fragment: Descendant[] = [
      { children: [{ text: 'hello' }], type: 'p' },
    ];

    pipeInsertFragment(editor, [firstPlugin, secondPlugin, thirdPlugin], {
      data: '',
      dataTransfer: {} as DataTransfer,
      fragment,
      mimeType: 'text/plain',
    });

    expect(calls).toEqual(['first:1', 'second:1']);
    expect(editor.children).toEqual(fragment);
  });
});
