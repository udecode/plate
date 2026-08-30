import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
  type BasePluginInput,
  BaseParagraphPlugin,
  createEditor,
} from '../../../core';
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
} from '../../../features/basic-nodes';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '../../../features/basic-styles';
import { BaseCalloutPlugin } from '../../../features/callout';
import { BaseCodeBlockPlugin } from '../../../features/code-block';
import { BaseCommentPlugin } from '../../../features/comment';
import { BaseDatePlugin } from '../../../features/date';
import { BaseDetailsPlugin } from '../../../features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote';
import { BaseColumnPlugin } from '../../../features/layout';
import { BaseLinkPlugin } from '../../../features/link';
import { BaseListPlugin } from '../../../features/list';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../../../features/media';
import { BaseMentionPlugin } from '../../../features/mention';
import { BaseSuggestionPlugin } from '../../../features/suggestion';
import { BaseTablePlugin } from '../../../features/table';
import { BaseTocPlugin } from '../../../features/toc';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import {
  withMarkdownRuntime,
  getMergedOptionsDeserialize,
  getMergedOptionsSerialize,
} from '../internal/markdownConversion';
import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkMdx, remarkMention } from '../plugins';
import type { DeserializeMdOptions, SerializeMdOptions } from '../types';

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
  BaseListPlugin,
  BaseMentionPlugin,
  BaseDatePlugin,
  BaseDetailsPlugin,
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
  createEditor({
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
