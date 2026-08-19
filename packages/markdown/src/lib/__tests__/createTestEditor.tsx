import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '@platejs/basic-styles';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseCommentPlugin } from '@platejs/comment';
import {
  type BasePluginInput,
  BaseParagraphPlugin,
  createBaseEditor,
} from '@platejs/core';
import { BaseDatePlugin } from '@platejs/date';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '@platejs/footnote';
import { BaseColumnPlugin } from '@platejs/layout';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseListPlugin as BaseIndentListPlugin } from '@platejs/list';
import { BaseListPlugin as BaseClassicListPlugin } from '@platejs/list-classic';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '@platejs/media';
import { BaseMentionPlugin } from '@platejs/mention';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { BaseTablePlugin } from '@platejs/table';
import { BaseTocPlugin } from '@platejs/toc';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../MarkdownPlugin';
import type { DeserializeMdOptions, SerializeMdOptions } from '../types';

import { withMarkdownRuntime } from '../internal/markdownConversion';
import {
  getMergedOptionsDeserialize,
  getMergedOptionsSerialize,
} from '../internal/markdownConversion';
import { remarkMdx, remarkMention } from '../plugins';

const testSchemaPlugins: readonly BasePluginInput[] = [
  BaseHeadingPlugin,

  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseScriptPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLinkPlugin,
  BaseCodeBlockPlugin,
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
  BaseIndentListPlugin,
  BaseClassicListPlugin,
  BaseMentionPlugin,
  BaseDatePlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseFilePlugin,
  BaseAudioPlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
  BaseColumnPlugin,
  BaseTablePlugin,
  BaseCalloutPlugin,
  BaseCommentPlugin,
  BaseSuggestionPlugin,
  BaseTocPlugin,
];

const markdownPlugin = MarkdownPlugin.configure({
  initialState: {
    plainMarks: ['suggestion', 'comment'],
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
  withMarkdownRuntime(
    editor,
    editor.plugin(MarkdownPlugin).store.get(),
    (runtime) => getMergedOptionsDeserialize(runtime, options)
  );

export const getTestSerializeOptions = (
  editor: ReturnType<typeof createTestEditor>,
  options?: SerializeMdOptions
) =>
  withMarkdownRuntime(
    editor,
    editor.plugin(MarkdownPlugin).store.get(),
    (runtime) => getMergedOptionsSerialize(runtime, options)
  );
