import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import {
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseHorizontalRulePlugin,
} from '@platejs/basic-nodes';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '@platejs/code-block';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
} from '@platejs/basic-styles';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseDatePlugin } from '@platejs/date';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '@platejs/footnote';
import { BaseColumnPlugin } from '@platejs/layout';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseListPlugin } from '@platejs/list';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '@platejs/media';
import { BaseMentionPlugin } from '@platejs/mention';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { BaseTocPlugin } from '@platejs/toc';
import { BaseParagraphPlugin, KEYS, createBaseEditor } from 'platejs';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';
import {
  remarkMdx,
  remarkMention,
} from '../../../../../../packages/markdown/src/lib/plugins';

const markdownPlugin = MarkdownPlugin.configure({
  initialState: {
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

const testPlugins = [
  BaseParagraphPlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeHighlightPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
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

export const createTestEditor = () =>
  createBaseEditor({ plugins: testPlugins });
