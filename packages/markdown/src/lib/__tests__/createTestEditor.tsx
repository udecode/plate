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
import type { DeserializeMdOptions } from '../deserializer';
import type { SerializeMdOptions } from '../serializer';

import { withMarkdownRuntime } from '../internal/markdownRuntime';
import {
  getMergedOptionsDeserialize,
  getMergedOptionsSerialize,
} from '../internal/markdownOptions';
import { remarkMdx, remarkMention } from '../plugins';

type TestElementOptions = {
  properties?: Readonly<Record<string, PropertyValueDescriptor>>;
  inlineContent?: boolean;
  inline?: boolean;
  type?: string;
  void?: boolean;
};

const element = (key: string, options: TestElementOptions = {}) => {
  const descriptor: SchemaElement = {
    ...(!options.void
      ? {
          content: options.inlineContent
            ? schema.content.any(
                [schema.content.text(), schema.content.group('inline')],
                { default: 'text', min: 1 }
              )
            : options.inline
              ? schema.content.text({ default: 'text', min: 1 })
              : schema.content.open(),
        }
      : {}),
    ...(options.inline ? { inline: true } : {}),
    ...(options.properties ? { properties: options.properties } : {}),
    ...(options.void ? { void: options.inline ? 'inline' : 'block' } : {}),
  };

  return createBasePlugin({
    key,
    schema: { element: descriptor },
    ...(options.type ? { type: options.type } : {}),
  });
};

const leaf = (key: string, type = key) =>
  createBasePlugin({
    key,
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
    type,
  });

const mediaProperties = {
  alt: property.string(),
  height: property.json(),
  isUpload: property.boolean(),
  name: property.string(),
  provider: property.string(),
  sourceUrl: property.string(),
  title: property.string(),
  url: property.string(),
  width: property.json(),
};

const testSchemaPlugins = [
  createBasePlugin({
    key: KEYS.list,
    schema: {
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
    },
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
  element(KEYS.file, {
    inlineContent: true,
    properties: mediaProperties,
  }),
  element(KEYS.audio, {
    inlineContent: true,
    properties: mediaProperties,
  }),
  element(KEYS.img, {
    inlineContent: true,
    properties: mediaProperties,
  }),
  element(KEYS.mediaEmbed, {
    inlineContent: true,
    properties: mediaProperties,
    type: NODES.mediaEmbed,
  }),
  element(KEYS.video, {
    inlineContent: true,
    properties: mediaProperties,
  }),
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

export const getTestDeserializeOptions = (
  editor: ReturnType<typeof createTestEditor>,
  options?: DeserializeMdOptions
) =>
  withMarkdownRuntime(editor, (runtime) =>
    getMergedOptionsDeserialize(runtime, options)
  );

export const getTestSerializeOptions = (
  editor: ReturnType<typeof createTestEditor>,
  options?: SerializeMdOptions
) =>
  withMarkdownRuntime(editor, (runtime) =>
    getMergedOptionsSerialize(runtime, options)
  );
