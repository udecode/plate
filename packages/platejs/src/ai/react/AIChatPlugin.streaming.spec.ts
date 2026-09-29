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
import { MarkdownPlugin } from '../../markdown';
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
            node: 'heading',
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

  it('invalidates a streamed preview when its final parse fails', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);

    // No installed mapping reads a quote, so a strict parse rejects it.
    const response = 'Text\n\n> Quote';

    ai.api.setPreview('previous');
    ai.api.setPreview(response, { final: false });
    expect(ai.store.get('previewValue')).not.toEqual([]);

    ai.api.setPreview(response);
    expect(ai.store.get('previewValue')).toEqual([]);
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('');
  });

  it('keeps each stored preview block that a continued parse reuses', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('First paragraph.\n\nSec', { final: false });
    ai.api.setPreview('First paragraph.\n\nSecond', { final: false });
    const [first] = ai.store.get('previewValue');

    ai.api.setPreview('First paragraph.\n\nSecond paragraph.', {
      final: false,
    });
    expect(ai.store.get('previewValue')[0]).toBe(first);

    // The strict final continues the latest preview too.
    ai.api.setPreview('First paragraph.\n\nSecond paragraph.');
    expect(ai.store.get('previewValue')[0]).toBe(first);
    expect(
      ai.store.get('previewValue').map((node) => NodeApi.string(node))
    ).toEqual(['First paragraph.', 'Second paragraph.']);
  });

  it('refuses to accept a final draft whose target was deleted', () => {
    const editor = createEditor();
    const ai = editor.plugin(AIChatPlugin);
    editor.update.nodes.insert(
      { children: [{ text: 'kept' }], type: 'paragraph' },
      { at: [1] }
    );

    ai.api.setPreview('complete');
    editor.update.nodes.remove({ at: [0] });
    const before = editor.read.value();

    ai.api.accept();

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.text.string([])).toBe('kept');
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
