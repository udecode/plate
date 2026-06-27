import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeTransformData } from './pipeTransformData';

const createParserEditor = (
  plugins: Parameters<typeof createBaseEditor>[0]['plugins']
) => createBaseEditor({ plugins });

describe('pipeTransformData', () => {
  it('pipes transformed data through parser plugins in order', () => {
    const calls: string[] = [];

    const firstPlugin = createBasePlugin({
      key: 'first',
      parser: {
        transformData: ({ data }) => {
          calls.push(`first:${data}`);
          return `${data}-alpha`;
        },
      },
    });

    const secondPlugin = createBasePlugin({
      key: 'second',
      parser: {
        transformData: ({ data }) => {
          calls.push(`second:${data}`);
          return `${data}-beta`;
        },
      },
    });

    const editor = createParserEditor([firstPlugin, secondPlugin]);

    const result = pipeTransformData(editor, [firstPlugin, secondPlugin], {
      data: 'start',
      dataTransfer: {} as DataTransfer,
      mimeType: 'text/plain',
    });

    expect(result).toBe('start-alpha-beta');
    expect(calls).toEqual(['first:start', 'second:start-alpha']);
  });

  it('skips plugins without transformData', () => {
    const activePlugin = createBasePlugin({
      key: 'active',
      parser: {
        transformData: ({ data }) => `${data}-done`,
      },
    });
    const passivePlugin = createBasePlugin({ key: 'passive' });

    const editor = createParserEditor([passivePlugin, activePlugin]);

    const result = pipeTransformData(editor, [passivePlugin, activePlugin], {
      data: 'start',
      dataTransfer: {} as DataTransfer,
      mimeType: 'text/plain',
    });

    expect(result).toBe('start-done');
  });
});
