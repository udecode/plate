import type { Descendant } from '@platejs/slate';

import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';
import { pipeInsertFragment } from './pipeInsertFragment';

const createParserEditor = (
  plugins: Parameters<typeof createSlateEditor>[0]['plugins']
) => createSlateEditor({ plugins });

describe('pipeInsertFragment', () => {
  it('stops at the first preInsert handler returning true and still inserts the fragment', () => {
    const calls: string[] = [];

    const firstPlugin = createSlatePlugin({
      key: 'first',
      parser: {
        preInsert: ({ fragment }) => {
          calls.push(`first:${fragment.length}`);
          return false;
        },
      },
    });

    const secondPlugin = createSlatePlugin({
      key: 'second',
      parser: {
        preInsert: ({ fragment }) => {
          calls.push(`second:${fragment.length}`);
          return true;
        },
      },
    });

    const thirdPlugin = createSlatePlugin({
      key: 'third',
      parser: {
        preInsert: () => {
          calls.push('third');
          return false;
        },
      },
    });

    const editor = createParserEditor([firstPlugin, secondPlugin, thirdPlugin]);
    const insertFragment = mock();

    editor.tf.insertFragment = insertFragment as any;

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
    expect(insertFragment).toHaveBeenCalledWith(fragment);
  });
});
