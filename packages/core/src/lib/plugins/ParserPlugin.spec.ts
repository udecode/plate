import { property, schema } from '@platejs/plite';

import { createPlateEditor } from '../../react/editor/withPlate';
import { createBaseEditor } from '../editor';
import { type PluginConfig, createBasePlugin } from '../plugin';

const createParagraph = (text: string) => ({
  children: [{ text }],
  type: 'p',
});
describe('ParserPlugin', () => {
  it('derives ordinary host codec ownership from the plugin schema binding', () => {
    const CardPlugin = createBasePlugin({
      key: 'cardParser',
      parser: {
        deserialize: ({ data }) => [
          { children: [{ text: data }], type: 'card' },
        ],
        format: 'application/x-card',
      },
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'card',
    });
    const editor = createBaseEditor({
      plugins: [CardPlugin],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'application/x-card' ? 'derived' : ''
      ),
      types: ['application/x-card'],
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'derived' }], type: 'card' },
    ]);
  });

  it('fits HTML leaf properties through the host codec pipeline', () => {
    const BoldPlugin = createBasePlugin({
      key: 'bold',
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      parsers: {
        html: {
          deserializer: { rules: [{ validNodeName: 'STRONG' }] },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [BoldPlugin],
      initialValue: [createParagraph('')],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/html' ? '<p><strong>bold</strong></p>' : ''
      ),
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: 'p' },
    ]);
  });

  it('pipes matching parser data into fragment insertion', () => {
    const PlainPlugin = createBasePlugin<PluginConfig<'plain'>>({
      key: 'plain',
      parser: {
        format: 'text/plain',
        schema: [{ kind: 'schema' }],
        query: ({ data }) => data === 'hello',
        transformData: ({ data }) => `${data}-world`,
        deserialize: ({ data }) => [createParagraph(data)],
        transformFragment: ({ fragment }) => [
          ...fragment,
          createParagraph('tail'),
        ],
      },
    });
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [PlainPlugin],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([
      createParagraph('hello-world'),
      createParagraph('tail'),
    ]);
  });

  it('falls back to the previous insertData transform when no parser inserts', () => {
    const PlainPlugin = createBasePlugin<PluginConfig<'plain'>>({
      key: 'plain',
      parser: {
        format: 'text/plain',
        schema: [{ kind: 'schema' }],
        deserialize: () => [],
      },
    });
    const initialValue = [createParagraph('initial')];
    const editor = createPlateEditor({
      initialValue,
      plugins: [PlainPlugin],
    });
    const dataTransfer = {
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any;

    const inserted = editor.api.clipboard.insertData(dataTransfer);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([createParagraph('initialhello')]);
  });

  it('routes base editor insertData through parser hooks', () => {
    const PlainPlugin = createBasePlugin<PluginConfig<'plain'>>({
      key: 'plain',
      parser: {
        format: 'text/plain',
        schema: [{ kind: 'schema' }],
        query: ({ data }) => data === 'hello',
        deserialize: ({ data }) => [createParagraph(data)],
        transformData: ({ data }) => `${data}-world`,
        transformFragment: ({ fragment }) => [
          ...fragment,
          createParagraph('tail'),
        ],
      },
    });
    const editor = createBaseEditor({
      plugins: [PlainPlugin],
      initialValue: [createParagraph('initial')],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([
      createParagraph('initialhello-world'),
      createParagraph('tail'),
    ]);
  });

  it('falls back to plain text insertData on the base editor route', () => {
    const editor = createBaseEditor({
      initialValue: [createParagraph('initial')],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([createParagraph('initialhello')]);
  });

  it('does not install parser runtime behavior when ParserPlugin is replaced', () => {
    const EmptyParserPlugin = createBasePlugin<PluginConfig<'parser'>>({
      key: 'parser',
    });
    const PlainPlugin = createBasePlugin<PluginConfig<'plain'>>({
      key: 'plain',
      parser: {
        format: 'text/plain',
        schema: [{ kind: 'schema' }],
        deserialize: () => [createParagraph('parsed')],
      },
    });
    const editor = createBaseEditor({
      plugins: [EmptyParserPlugin, PlainPlugin],
      initialValue: [createParagraph('initial')],
    });

    const inserted = editor.api.clipboard.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any);

    expect(inserted).toBe(true);
    expect(editor.read.children()).toEqual([createParagraph('initialhello')]);
  });
});
