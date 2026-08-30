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
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
  BaseListPlugin,
  createEditor,
  type Value,
  BaseParagraphPlugin,
} from 'platejs';
import { BaseMentionPlugin } from 'platejs/mention';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
} from 'platejs/table';

import { MarkdownKit } from '@/registry/components/editor/markdown';

const BasePlugins = [
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
  // BaseColumnPlugin,
  // BaseColumnItemPlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseScriptPlugin,
  BaseMentionPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseListPlugin,
  ...MarkdownKit,
];

export const createTestEditor = (value: Value) =>
  createEditor({
    plugins: BasePlugins,
    initialValue: value,
  });
