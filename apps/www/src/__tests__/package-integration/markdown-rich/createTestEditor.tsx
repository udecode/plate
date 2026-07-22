import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
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
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { BaseListPlugin } from '@platejs/list';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '@platejs/footnote';
import { BaseParagraphPlugin, KEYS, createBaseEditor } from 'platejs';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
  MarkdownPlugin,
} from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';
import {
  remarkMdx,
  remarkMention,
} from '../../../../../../packages/markdown/src/lib/plugins';

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

export const createTestEditor = (plugins: any[] = []) =>
  createBaseEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseH1Plugin,
      BaseH2Plugin,
      BaseH3Plugin,
      BaseBlockquotePlugin,
      BaseHorizontalRulePlugin,
      BaseCodeBlockPlugin,
      BaseCodeLinePlugin,
      BaseCodeSyntaxPlugin,
      BaseTablePlugin,
      BaseTableRowPlugin,
      BaseTableCellPlugin,
      BaseTableCellHeaderPlugin,
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseUnderlinePlugin,
      BaseCodePlugin,
      BaseStrikethroughPlugin,
      BaseSubscriptPlugin,
      BaseSuperscriptPlugin,
      BaseHighlightPlugin,
      BaseKbdPlugin,
      BaseListPlugin,
      BaseLinkPlugin,
      BaseEquationPlugin,
      BaseInlineEquationPlugin,
      BaseFootnoteReferencePlugin,
      BaseFootnoteDefinitionPlugin,
      markdownPlugin,
      ...plugins,
    ],
  } as any);
