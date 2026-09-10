import remarkMath from 'remark-math';

import {
  BaseParagraphPlugin,
  defineBasePlugin,
  NodeApi,
  property,
  schema,
  PLUGINS,
} from '../../core';
import { BaseColumnPlugin, BaseColumnItemPlugin } from '../../features/layout';
import { BaseListPlugin } from '../../features/list';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
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
  it('replays paragraph and opening column markup with List corrections without a document commit', () => {
    const editor = createProductEditor({
      plugins: [
        BaseListPlugin.configure({ targetPlugins: [PLUGINS.paragraph] }),
        BaseColumnPlugin,
        BaseColumnItemPlugin,
        MarkdownPlugin,
        AIChatPlugin,
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
    const ai = editor.plugin(AIChatPlugin);
    const before = editor.read.children();
    const id = ai.api.start();
    ai.api.receive(id, 'paragraph\n\n');
    ai.api.receive(id, 'paragraph\n\n<column_group>\n');
    expect(NodeApi.string(ai.store.get('operation')!.value[0])).toBe(
      'paragraph'
    );
    expect(editor.read.children()).toBe(before);
    const source =
      'paragraph\n\n<column_group>\n<column width="50%">\nleft\n</column>\n</column_group>\n\nlast';
    ai.api.receive(id, source);
    ai.api.finish(id);
    expect(ai.store.get('operation')!.value).toEqual(
      editor.api.markdown.deserialize(source).children
    );
  });

  for (const paragraphType of ['paragraph', 'customParagraph']) {
    it(`keeps raw trailing newlines with resolved ${paragraphType} semantics`, () => {
      const editor = createEditor(paragraphType);
      const ai = editor.plugin(AIChatPlugin);
      const id = ai.api.start();
      ai.api.receive(id, 'hello\n\n');
      expect(ai.store.get('operation')!.source).toBe('hello\n\n');
      expect(ai.store.get('operation')!.value).toEqual(
        editor.api.markdown.deserialize('hello\n\n').children
      );
      expect(ai.store.get('operation')!.value[0].type).toBe(paragraphType);
    });
  }
  for (const source of [
    '```typescript\nconst answer = 42;\n```\n\n',
    '$$\nx+1\n$$\n',
  ]) {
    it('preserves code/math fence source and complete parser semantics', () => {
      const editor = createEditor();
      const ai = editor.plugin(AIChatPlugin);
      const id = ai.api.start();
      for (let end = 1; end <= source.length; end += 1) {
        ai.api.receive(id, source.slice(0, end));
      }
      ai.api.finish(id);
      expect(ai.store.get('operation')!.source).toBe(source);
      expect(ai.store.get('operation')!.value).toEqual(
        editor.api.markdown.deserialize(source).children
      );
    });
  }
  it('keeps preview metadata out of the accepted empty block', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start();
    ai.api.receive(id, 'hello');
    expect(editor.read.text.string([])).toBe('');
    ai.api.finish(id);
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ]);
  });
  it('replaces a generated heading when a snapshot changes its level', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start();
    ai.api.receive(id, '# One');
    ai.api.receive(id, '## Two');
    expect(ai.store.get('operation')!.value[0]).toEqual({
      type: 'heading',
      level: 2,
      children: [{ text: 'Two' }],
    });
  });
});
