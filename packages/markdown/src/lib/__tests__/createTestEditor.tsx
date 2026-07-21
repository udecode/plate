import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import {
  type PropertyValueDescriptor,
  type SchemaElement,
  property,
  schema,
  target,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { withMarkdownRuntime } from '../markdown-runtime';
import { remarkMdx, remarkMention } from '../plugins';

type TestElementOptions = {
  properties?: Readonly<Record<string, PropertyValueDescriptor>>;
  inline?: boolean;
  type?: string;
  void?: boolean;
};

const element = (key: string, options: TestElementOptions = {}) => {
  const descriptor: SchemaElement = {
    ...(options.inline ? { inline: true } : {}),
    ...(options.properties ? { properties: options.properties } : {}),
    ...(options.void ? { void: options.inline ? 'inline' : 'block' } : {}),
  };

  return createBasePlugin({
    key,
    node: {
      element: descriptor,
      ...(options.type ? { type: options.type } : {}),
    },
  });
};

const leaf = (key: string, type = key) =>
  createBasePlugin({ key, node: { mark: true, type } });

const testSchemaPlugins = [
  createBasePlugin({
    key: KEYS.list,
    schema: schema.contribution({
      properties: Object.entries({
        checked: property.boolean(),
        indent: property.number(),
        listRestart: property.number(),
        listRestartPolite: property.number(),
        listStart: property.number(),
        listStyleType: property.string(),
      }).map(([key, value]) =>
        schema.elementProperty(key, value, {
          target: target.group('element'),
        })
      ),
    }),
  }),
  ...KEYS.heading.map((key) => element(key)),
  element(KEYS.blockquote),
  element(KEYS.hr, { void: true }),
  element(KEYS.codeBlock, { type: NODES.codeBlock }),
  element(KEYS.codeLine, { type: NODES.codeLine }),
  leaf(KEYS.codeSyntax, NODES.codeSyntax),
  leaf(KEYS.bold),
  leaf(KEYS.italic),
  leaf(KEYS.underline),
  leaf(KEYS.code),
  leaf(KEYS.strikethrough),
  leaf(KEYS.sub),
  leaf(KEYS.sup),
  leaf(KEYS.highlight),
  leaf(KEYS.kbd),
  element(KEYS.a, { inline: true }),
  element(KEYS.footnoteReference, { inline: true, void: true }),
  element(KEYS.footnoteDefinition),
  element(KEYS.olClassic),
  element(KEYS.ulClassic),
  element(KEYS.li),
  element(KEYS.lic),
  element(KEYS.mention, {
    properties: {
      key: property.string(),
      value: property.string(),
    },
    inline: true,
    void: true,
  }),
  element(KEYS.date, { inline: true, void: true }),
  element(KEYS.equation, { void: true }),
  element(KEYS.inlineEquation, {
    inline: true,
    type: NODES.inlineEquation,
    void: true,
  }),
  element(KEYS.file, { void: true }),
  element(KEYS.audio, { void: true }),
  element(KEYS.img, { void: true }),
  element(KEYS.mediaEmbed, { type: NODES.mediaEmbed, void: true }),
  element(KEYS.video, { void: true }),
  element(KEYS.columnGroup, { type: NODES.columnGroup }),
  element(KEYS.column),
  element(KEYS.table),
  element(KEYS.tr),
  element(KEYS.td),
  element(KEYS.th),
];

const markdownPlugin = MarkdownPlugin.configure({
  options: {
    plainMarks: [KEYS.suggestion, KEYS.comment],
    remarkPlugins: [
      remarkMath,
      remarkGfm,
      remarkEmoji,
      remarkMdx,
      remarkMention,
    ],
  },
});

export const createTestEditor = () =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, ...testSchemaPlugins, markdownPlugin],
  });

export const getTestMarkdownRuntime = (
  editor: ReturnType<typeof createTestEditor>
) => withMarkdownRuntime(editor, (runtime) => runtime);
