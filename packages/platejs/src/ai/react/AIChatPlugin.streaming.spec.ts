import remarkMath from 'remark-math';

import {
  BaseParagraphPlugin,
  defineBasePlugin,
  NodeApi,
  property,
  schema,
  PLUGINS,
} from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { AI_PREVIEW_KEY } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = (paragraphType = 'paragraph') => {
  const plugins = [
    BaseParagraphPlugin,
    defineBasePlugin(PLUGINS.codeBlock, {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/markdown': {
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
    defineBasePlugin(PLUGINS.equation, {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/markdown': {
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
    defineBasePlugin(PLUGINS.heading, {
      codecs: ({ defineCodecs, schema: { type } }) =>
        defineCodecs({
          'text/markdown': {
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
      initialState: { remarkPlugins: [remarkMath] },
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
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: paragraphType }],
  });
};

describe('AIChatPlugin streaming', () => {
  it('keeps a trailing empty paragraph while deserializing chunks', () => {
    const editor = createEditor();

    expect(
      editor.plugin(AIChatPlugin).api.deserializeChunk('hello\n\n')
    ).toEqual([
      { children: [{ text: 'hello' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('uses the resolved paragraph type while deserializing chunks', () => {
    const editor = createEditor('customParagraph');

    expect(
      editor.plugin(AIChatPlugin).api.deserializeChunk('hello\n\n')
    ).toEqual([
      { children: [{ text: 'hello' }], type: 'customParagraph' },
      { children: [{ text: '' }], type: 'customParagraph' },
    ]);
  });

  it('does not carry suggestion metadata into applied AI content', () => {
    const editor = createEditor();
    const aiChat = editor.plugin(AIChatPlugin);
    const nodeKey = editor.key([0])!;

    aiChat.store.set({
      chatNodes: [
        {
          node: {
            children: [{ comment: true, suggestion: true, text: 'hello' }],
            suggestionData: [],
            suggestionTransient: true,
            suggestion_old: { id: 'old' },
            type: 'paragraph',
          },
          nodeKey,
        },
      ],
    });

    aiChat.update.applySuggestions('hello');

    const serialized = JSON.stringify(editor.read.children());

    expect(serialized).not.toContain('suggestionData');
    expect(serialized).not.toContain('suggestion_old');
    expect(serialized).not.toContain('"comment"');
    expect(serialized).not.toContain('"suggestion":');
  });

  it('preserves closing code and math fences before trailing newlines', () => {
    const editor = createEditor();
    const { read } = editor.plugin(AIChatPlugin);

    expect(
      read.serializeChunk(
        {
          value: {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'const answer = 42;' }],
                    type: 'codeLine',
                  },
                ],
                lang: 'typescript',
                type: 'codeBlock',
              },
            ],
          },
        },
        '```typescript\nconst answer = 42;\n```\n\n'
      )
    ).toBe('```typescript\nconst answer = 42;\n```\n');
    expect(
      read.serializeChunk(
        {
          value: {
            children: [
              {
                children: [{ text: '' }],
                latex: 'x+1',
                type: 'equation',
              },
            ],
          },
        },
        '$$\nx+1\n$$\n'
      )
    ).toBe('$$\nx+1\n$$\n');
  });

  it('streams into the current empty block with supplied element props', () => {
    const editor = createEditor();

    editor.plugin(AIChatPlugin).update.insertChunk('hello', {
      elementProps: { [AI_PREVIEW_KEY]: true },
    });

    expect(editor.read.text.string([])).toBe('hello');
    expect(Reflect.get(editor.read.children()[0], AI_PREVIEW_KEY)).toBe(true);
  });

  it('replaces a streamed heading when its canonical level changes', () => {
    const editor = createEditor();
    const aiChat = editor.plugin(AIChatPlugin);

    editor.update.nodes.set({ level: 1, type: 'heading' }, { at: [0] });
    aiChat.store.set({ _blockChunks: '', _blockPath: [0] });

    aiChat.update.insertChunk('## Two');

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'Two' }],
      level: 2,
      type: 'heading',
    });
  });
});
