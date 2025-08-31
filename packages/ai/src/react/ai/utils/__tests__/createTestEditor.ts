import { createSlateEditor, Value } from 'platejs';
/** @ts-nocheck */
import { getCommentKey } from '@platejs/comment';
import {
  convertChildrenDeserialize,
  deserializeMd,
  parseAttributes,
} from '@platejs/markdown';
import {
  BaseParagraphPlugin,
  getPluginType,
  KEYS,
  Range,
  TextApi,
} from 'platejs';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { BaseMentionPlugin } from '@platejs/mention';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { BaseListPlugin } from '@platejs/list';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
} from '@platejs/table';
import { MarkdownKit } from '../../../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';

const BasePlugins = [
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
  // BaseColumnPlugin,
  // BaseColumnItemPlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseMentionPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseListPlugin,
  ...MarkdownKit,
];

export const createTestEditor = (value: Value) => {
  return createSlateEditor({
    plugins: BasePlugins,
    value: value,
  });
};
