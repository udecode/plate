import remarkMath from 'remark-math';

import { DefaultAuthoredPlugin } from '../../authored';
import {
  BaseParagraphPlugin,
  definePlugin,
  NodeApi,
  property,
  schema,
  PLUGINS,
} from '../../core';
import { MarkdownPlugin, remarkMdx } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = (paragraphType = 'paragraph') => {
  const plugins = [
    DefaultAuthoredPlugin,
    BaseParagraphPlugin,
    definePlugin(PLUGINS.codeBlock, {
      formats: ({ defineFormats }) =>
        defineFormats({
          markdown: {
            kind: 'node',
            encode: ({ node }) => ({
              lang: node.lang,
              type: 'code',
              value: node.children
                .map((child) => NodeApi.string(child))
                .join('\n'),
            }),
          },
        }),
      schema: {
        element: {
          content: schema.content.open(),
          properties: { lang: property.string() },
        },
      },
    }),
    definePlugin(PLUGINS.equation, {
      formats: ({ defineFormats }) =>
        defineFormats({
          markdown: {
            kind: 'node',
            encode: ({ node }) => ({
              type: 'math',
              value: node.latex ?? '',
            }),
          },
        }),
      schema: {
        element: {
          properties: { latex: property.string() },
          void: 'block',
        },
      },
    }),
    definePlugin(PLUGINS.heading, {
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({
          markdown: {
            from: 'heading',
            kind: 'node',
            decode: ({ decode, decoration, node }) => ({
              children: decode(node.children, decoration),
              level: node.depth,
              type,
            }),
          },
        }),
      schema: {
        element: {
          content: schema.content.open(),
          properties: { level: property.number() },
        },
      },
    }),
    MarkdownPlugin.configure({
      initialState: { remarkPlugins: [remarkMath, remarkMdx] },
    }),
    AIChatPlugin,
  ] as const;
  const applicationSchema = {
    overrides: [
      schema.override(BaseParagraphPlugin, {
        element: { type: paragraphType },
      }),
    ],
  } as const;

  return createProductEditor({
    plugins,
    schema: applicationSchema,
    userId: 'alice',
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: paragraphType }],
  });
};

describe('AIChatPlugin streaming', () => {
  it('accepts only the current finalized preview', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('partial', { final: false });
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('');

    ai.api.setPreview('complete');
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('complete');
  });

  it('invalidates a recovered stream when its final parse fails', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('previous');
    ai.api.setPreview('<u>', { final: false });
    expect(ai.store.get('previewValue')).not.toEqual([]);

    ai.api.setPreview('<u>');
    expect(ai.store.get('previewValue')).toEqual([]);
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('');
  });

  it('keeps streamed output in a draft until one accepted edit', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);
    const before = editor.read.value();

    ai.api.setPreview('hello');
    ai.api.setPreview('hello world');

    expect(editor.read.text.string([])).toBe('');
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.authored.view()).toEqual({
      intent: 'edit',
      projection: 'accepted',
    });
    expect(
      ai.store.get('previewValue').map((node) => NodeApi.string(node))
    ).toEqual(['hello world']);

    ai.api.accept();

    expect(editor.read.text.string([])).toBe('hello world');
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(0);
    editor.api.history.undo();
    expect(editor.read.text.string([])).toBe('');
  });

  it('reparses the complete response as a heading or custom paragraph', () => {
    const editor = createEditor('customParagraph');
    const ai = editor.plugin(AIChatPlugin);
    ai.api.setPreview('# One');
    expect(ai.store.get('previewValue')[0]).toMatchObject({
      type: 'heading',
      level: 1,
    });
    ai.api.setPreview('## Two');
    expect(ai.store.get('previewValue')[0]).toMatchObject({
      type: 'heading',
      level: 2,
    });
    ai.api.setPreview('text');
    expect(ai.store.get('previewValue')[0]).toMatchObject({
      type: 'customParagraph',
    });
  });
});
