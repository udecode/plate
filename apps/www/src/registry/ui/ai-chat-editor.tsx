'use client';

import * as React from 'react';

import { withProps } from '@udecode/cn';
import { BaseParagraphPlugin, SlateLeaf } from '@udecode/plate';
import { useAIChatEditor } from '@udecode/plate-ai/react';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { BaseCalloutPlugin } from '@udecode/plate-callout';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@udecode/plate-code-block';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '@udecode/plate-font';
import { BaseHeadingPlugin, BaseTocPlugin } from '@udecode/plate-heading';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseListPlugin } from '@udecode/plate-list';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '@udecode/plate-math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { usePlateEditor } from '@udecode/plate/react';
import { all, createLowlight } from 'lowlight';

import { MarkdownKit } from '@/registry/components/editor/plugins/markdown-kit';
import { TodoLiStatic, TodoMarkerStatic } from '@/registry/ui/list-todo-static';

import { BlockquoteElementStatic } from './blockquote-node-static';
import { CalloutElementStatic } from './callout-node-static';
import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from './code-block-node-static';
import { CodeLeafStatic } from './code-node-static';
import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from './column-node-static';
import { DateElement } from './date-node';
import { EditorStatic } from './editor-static';
import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from './equation-node-static';
import { HeadingElementStatic } from './heading-node-static';
import { HighlightLeafStatic } from './highlight-node-static';
import { HrElementStatic } from './hr-node-static';
import { KbdLeaf } from './kbd-node';
import { LinkElementStatic } from './link-node-static';
import { AudioElementStatic } from './media-audio-node-static';
import { FileElementStatic } from './media-file-node-static';
import { ImageElementStatic } from './media-image-node-static';
import { VideoElementStatic } from './media-video-node-static';
import { MentionElementStatic } from './mention-node-static';
import { ParagraphElementStatic } from './paragraph-node-static';
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
  TableElementStatic,
  TableRowElementStatic,
} from './table-node-static';
import { TocElementStatic } from './toc-node-static';

const components = {
  [BaseAudioPlugin.key]: AudioElementStatic,
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
  [BaseCalloutPlugin.key]: CalloutElementStatic,
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseColumnItemPlugin.key]: ColumnElementStatic,
  [BaseColumnPlugin.key]: ColumnGroupElementStatic,
  [BaseDatePlugin.key]: DateElement,
  [BaseEquationPlugin.key]: EquationElementStatic,
  [BaseFilePlugin.key]: FileElementStatic,
  [BaseHighlightPlugin.key]: HighlightLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
  [BaseKbdPlugin.key]: KbdLeaf,
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseMentionPlugin.key]: MentionElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 's' }),
  [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: 'sub' }),
  [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: 'sup' }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseTocPlugin.key]: TocElementStatic,
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),

  [BaseVideoPlugin.key]: VideoElementStatic,
  h1: withProps(HeadingElementStatic, { variant: 'h1' }),
  h2: withProps(HeadingElementStatic, { variant: 'h2' }),
  h3: withProps(HeadingElementStatic, { variant: 'h3' }),

  // [BaseCommentsPlugin.key]: CommentLeafStatic
  // [BaseTogglePlugin.key]: ToggleElementStatic
};
const lowlight = createLowlight(all);

const plugins = [
  BaseColumnItemPlugin,
  BaseColumnPlugin,
  BaseBlockquotePlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseImagePlugin,
  BaseKbdPlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin.configure({ options: { lowlight } }),
  BaseDatePlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
  BaseFontFamilyPlugin,
  BaseFontWeightPlugin,
  BaseFontBackgroundColorPlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseTablePlugin,
  BaseTocPlugin,
  BaseHighlightPlugin,
  BaseLinkPlugin,
  BaseMentionPlugin,
  BaseParagraphPlugin,
  BaseCalloutPlugin,
  BaseIndentPlugin.extend({
    inject: {
      targetPlugins: [BaseParagraphPlugin.key],
    },
  }),
  BaseListPlugin.extend({
    inject: {
      targetPlugins: [BaseParagraphPlugin.key],
    },
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLiStatic,
          markerComponent: TodoMarkerStatic,
          type: 'todo',
        },
      },
    },
  }),
  ...MarkdownKit,
];

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const aiEditor = usePlateEditor({
    plugins,
  });

  useAIChatEditor(aiEditor, content);

  return (
    <EditorStatic variant="aiChat" components={components} editor={aiEditor} />
  );
});
