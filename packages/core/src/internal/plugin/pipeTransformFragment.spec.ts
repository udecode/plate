import type { Descendant } from '@platejs/slate';

import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';
import { pipeTransformFragment } from './pipeTransformFragment';

const createParserEditor = (
  plugins: Parameters<typeof createSlateEditor>[0]['plugins']
) => createSlateEditor({ plugins });

const createParagraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'p',
});

describe('pipeTransformFragment', () => {
  it('pipes transformed fragments through parser plugins in order', () => {
    const calls: string[] = [];

    const firstPlugin = createSlatePlugin({
      key: 'first',
      parser: {
        transformFragment: ({ fragment }) => {
          calls.push(`first:${fragment.length}`);
          return [...fragment, createParagraph('second')];
        },
      },
    });

    const secondPlugin = createSlatePlugin({
      key: 'second',
      parser: {
        transformFragment: ({ fragment }) => {
          calls.push(`second:${fragment.length}`);

          return fragment.map((node, index) =>
            index === 0 ? createParagraph('first-updated') : node
          );
        },
      },
    });

    const editor = createParserEditor([firstPlugin, secondPlugin]);

    const result = pipeTransformFragment(editor, [firstPlugin, secondPlugin], {
      data: '',
      dataTransfer: {} as DataTransfer,
      fragment: [createParagraph('first')],
      mimeType: 'text/plain',
    });

    expect(result).toEqual([
      createParagraph('first-updated'),
      createParagraph('second'),
    ]);
    expect(calls).toEqual(['first:1', 'second:2']);
  });
});
