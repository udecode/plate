import { createBaseEditor, type Value } from 'platejs';
import { BaseParagraphPlugin } from 'platejs';

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
import { BaseMentionPlugin } from '@platejs/mention';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '@platejs/code-block';
import { BaseListPlugin } from '@platejs/list';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
} from '@platejs/table';
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
  createBaseEditor({
    plugins: BasePlugins,
    initialValue: value,
  });
