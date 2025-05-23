'use client';

import * as React from 'react';

import { withProps } from '@udecode/cn';
import { BaseParagraphPlugin, KEYS, SlateLeaf } from '@udecode/plate';
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
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
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
import { BaseImagePlugin } from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import { BaseTablePlugin } from '@udecode/plate-table';
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
  [KEYS.audio]: AudioElementStatic,
  [KEYS.blockquote]: BlockquoteElementStatic,
  [KEYS.bold]: withProps(SlateLeaf, { as: 'strong' }),
  [KEYS.callout]: CalloutElementStatic,
  [KEYS.code]: CodeLeafStatic,
  [KEYS.codeBlock]: CodeBlockElementStatic,
  [KEYS.codeLine]: CodeLineElementStatic,
  [KEYS.codeSyntax]: CodeSyntaxLeafStatic,
  [KEYS.column]: ColumnElementStatic,
  [KEYS.columnGroup]: ColumnGroupElementStatic,
  [KEYS.date]: DateElement,
  [KEYS.equation]: EquationElementStatic,
  [KEYS.file]: FileElementStatic,
  [KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
  [KEYS.highlight]: HighlightLeafStatic,
  [KEYS.hr]: HrElementStatic,
  [KEYS.img]: ImageElementStatic,
  [KEYS.inlineEquation]: InlineEquationElementStatic,
  [KEYS.italic]: withProps(SlateLeaf, { as: 'em' }),
  [KEYS.kbd]: KbdLeaf,
  [KEYS.link]: LinkElementStatic,
  [KEYS.mention]: MentionElementStatic,
  [KEYS.p]: ParagraphElementStatic,
  [KEYS.strikethrough]: withProps(SlateLeaf, { as: 's' }),
  [KEYS.sub]: withProps(SlateLeaf, { as: 'sub' }),
  [KEYS.sup]: withProps(SlateLeaf, { as: 'sup' }),
  [KEYS.table]: TableElementStatic,
  [KEYS.td]: TableCellElementStatic,
  [KEYS.th]: TableCellHeaderStaticElement,

  [KEYS.toc]: TocElementStatic,
  [KEYS.tr]: TableRowElementStatic,
  [KEYS.underline]: withProps(SlateLeaf, { as: 'u' }),
  [KEYS.video]: VideoElementStatic,

  // [KEYS.comment]: CommentLeafStatic
  // [KEYS.toggle]: ToggleElementStatic
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
      targetPlugins: [KEYS.p],
    },
  }),
  BaseListPlugin.extend({
    inject: {
      targetPlugins: [KEYS.p],
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
