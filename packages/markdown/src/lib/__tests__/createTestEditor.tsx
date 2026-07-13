import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkMdx, remarkMention } from '../plugins';

const element = (key: string, node: Record<string, unknown> = {}) =>
  createBasePlugin({ key, node: { isElement: true, ...node } });

const leaf = (key: string) => createBasePlugin({ key, node: { isLeaf: true } });

const testSchemaPlugins = [
  createBasePlugin({ key: KEYS.list }),
  ...KEYS.heading.map((key) => element(key)),
  element(KEYS.blockquote),
  element(KEYS.hr, { isVoid: true }),
  element(KEYS.codeBlock),
  element(KEYS.codeLine),
  leaf(KEYS.codeSyntax),
  leaf(KEYS.bold),
  leaf(KEYS.italic),
  leaf(KEYS.underline),
  leaf(KEYS.code),
  leaf(KEYS.strikethrough),
  leaf(KEYS.sub),
  leaf(KEYS.sup),
  leaf(KEYS.highlight),
  leaf(KEYS.kbd),
  element(KEYS.a, { isInline: true }),
  element(KEYS.footnoteReference, { isInline: true, isVoid: true }),
  element(KEYS.footnoteDefinition),
  element(KEYS.olClassic),
  element(KEYS.ulClassic),
  element(KEYS.li),
  element(KEYS.lic),
  element(KEYS.mention, { isInline: true, isVoid: true }),
  element(KEYS.date, { isInline: true, isVoid: true }),
  element(KEYS.equation, { isVoid: true }),
  element(KEYS.inlineEquation, { isInline: true, isVoid: true }),
  element(KEYS.file, { isVoid: true }),
  element(KEYS.audio, { isVoid: true }),
  element(KEYS.img, { isVoid: true }),
  element(KEYS.mediaEmbed, { isVoid: true }),
  element(KEYS.video, { isVoid: true }),
  element(KEYS.columnGroup, { isContainer: true }),
  element(KEYS.column, { isContainer: true }),
  element(KEYS.table, { isContainer: true }),
  element(KEYS.tr, { isContainer: true }),
  element(KEYS.td, { isContainer: true }),
  element(KEYS.th, { isContainer: true }),
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
