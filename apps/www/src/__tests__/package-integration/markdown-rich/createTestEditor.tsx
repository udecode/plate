import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  createEditor,
  ElementIdPlugin,
} from 'platejs';
import { BaseCalloutPlugin } from 'platejs/callout';
import { BaseDatePlugin } from 'platejs/date';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from 'platejs/footnote';
import { BaseColumnPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from 'platejs/media';
import { BaseMentionPlugin } from 'platejs/mention';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../../../../../../packages/platejs/src/markdown/lib/MarkdownPlugin';
import {
  remarkMdx,
  remarkMention,
} from '../../../../../../packages/platejs/src/markdown/lib/plugins';

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

const testPlugins = [
  BaseParagraphPlugin,
  BaseHeadingPlugin,

  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeHighlightPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseScriptPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseListPlugin,
  BaseLinkPlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseFootnotePlugin,
  BaseFootnoteDefinitionPlugin,
  BaseImagePlugin,
  BaseFilePlugin,
  BaseAudioPlugin,
  BaseVideoPlugin,
  BaseMediaEmbedPlugin,
  BaseTocPlugin,
  BaseColumnPlugin,
  BaseMentionPlugin,
  BaseDatePlugin,
  BaseFontColorPlugin,
  BaseFontBackgroundColorPlugin,
  BaseCalloutPlugin,
  markdownPlugin,
] as const;

export const createTestEditor = ({ elementIds = false } = {}) =>
  createEditor({
    plugins: [...(elementIds ? [ElementIdPlugin] : []), ...testPlugins],
  });
