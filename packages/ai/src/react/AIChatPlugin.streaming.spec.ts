import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { NodeApi, property, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import remarkMath from 'remark-math';

import { AI_PREVIEW_KEY } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = () =>
  createPlateEditor({
    plugins: [
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
                value: node.texExpression ?? '',
              }),
            },
          }),
        schema: {
          element: {
            properties: { texExpression: property.string() },
            void: 'block',
          },
        },
      }),
      MarkdownPlugin.configure({
        initialState: { remarkPlugins: [remarkMath] },
      }),
      AIChatPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });

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

  it('preserves closing code and math fences before trailing newlines', () => {
    const editor = createEditor();
    const read = editor.plugin(AIChatPlugin).read;

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
                texExpression: 'x+1',
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
    expect(Reflect.get(editor.read.children()[0]!, AI_PREVIEW_KEY)).toBe(true);
  });
});
