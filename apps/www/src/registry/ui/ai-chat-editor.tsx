'use client';

import * as React from 'react';

import { BaseParagraphPlugin, KEYS } from '@udecode/plate';
import { useAIChatEditor } from '@udecode/plate-ai/react';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '@udecode/plate-basic-elements';
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
} from '@udecode/plate-basic-marks';
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
import { BaseIndentPlugin } from '@udecode/plate-indent';
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
import { BaseTocPlugin } from '@udecode/plate-toc';
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
import {
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
} from './heading-node-static';
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
  [KEYS.h1]: H1ElementStatic,
  [KEYS.h2]: H2ElementStatic,
  [KEYS.h3]: H3ElementStatic,
  [KEYS.highlight]: HighlightLeafStatic,
  [KEYS.hr]: HrElementStatic,
  [KEYS.img]: ImageElementStatic,
  [KEYS.inlineEquation]: InlineEquationElementStatic,
  [KEYS.kbd]: KbdLeaf,
  [KEYS.link]: LinkElementStatic,
  [KEYS.mention]: MentionElementStatic,
  [KEYS.p]: ParagraphElementStatic,
  [KEYS.table]: TableElementStatic,
  [KEYS.td]: TableCellElementStatic,
  [KEYS.th]: TableCellHeaderStaticElement,

  [KEYS.toc]: TocElementStatic,
  [KEYS.tr]: TableRowElementStatic,
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
