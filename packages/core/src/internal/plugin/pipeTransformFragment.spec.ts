import type { Descendant } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeTransformFragment } from './pipeTransformFragment';

const createParserEditor = (
  plugins: Parameters<typeof createBaseEditor>[0]['plugins']
) => createBaseEditor({ plugins });

const createParagraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'p',
});

describe('pipeTransformFragment', () => {
  it('pipes transformed fragments through parser plugins in order', () => {
    const calls: string[] = [];

    const firstPlugin = createBasePlugin({
      key: 'first',
      parser: {
        transformFragment: ({ fragment }) => {
          calls.push(`first:${fragment.length}`);
          return [...fragment, createParagraph('second')];
        },
      },
    });

    const secondPlugin = createBasePlugin({
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
