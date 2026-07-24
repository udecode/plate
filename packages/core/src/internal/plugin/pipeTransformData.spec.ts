import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeTransformData } from './pipeTransformData';
import { prepareHtmlRegistry } from './prepareHtmlRegistry';

const createHtmlEditor = (
  plugins: NonNullable<Parameters<typeof createBaseEditor>[0]>['plugins']
) =>
  createBaseEditor({
    plugins,
  });

describe('pipeTransformData', () => {
  it('pipes transformed data through HTML plugins in order', () => {
    const calls: string[] = [];

    const firstPlugin = createBasePlugin({
      key: 'first',
      parsers: {
        html: {
          transformData: ({ data }) => {
            calls.push(`first:${data}`);
            return `${data}-alpha`;
          },
        },
      },
    });

    const secondPlugin = createBasePlugin({
      key: 'second',
      parsers: {
        html: {
          transformData: ({ data }) => {
            calls.push(`second:${data}`);
            return `${data}-beta`;
          },
        },
      },
    });

    const editor = createHtmlEditor([firstPlugin, secondPlugin]);

    const result = editor.read((state) =>
      pipeTransformData(state, prepareHtmlRegistry(editor).plugins, {
        data: 'start',
        format: 'text/html',
        source: { files: [] as any, getData: () => '', types: [] },
      })
    );

    expect(result).toBe('start-alpha-beta');
    expect(calls).toEqual(['first:start', 'second:start-alpha']);
  });

  it('skips plugins without transformData', () => {
    const activePlugin = createBasePlugin({
      key: 'active',
      parsers: {
        html: {
          transformData: ({ data }) => `${data}-done`,
        },
      },
    });
    const passivePlugin = createBasePlugin({ key: 'passive' });

    const editor = createHtmlEditor([passivePlugin, activePlugin]);

    const result = editor.read((state) =>
      pipeTransformData(state, prepareHtmlRegistry(editor).plugins, {
        data: 'start',
        format: 'text/html',
        source: { files: [] as any, getData: () => '', types: [] },
      })
    );

    expect(result).toBe('start-done');
  });
});
