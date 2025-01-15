'use client';

import React, { memo } from 'react';

import { withProps } from '@udecode/cn';
import { BaseParagraphPlugin, SlateLeaf } from '@udecode/plate';
import { usePlateEditor } from '@udecode/plate/react';
import { useAIChatEditor } from '@udecode/plate-ai/react';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@udecode/plate-code-block';
import { BaseHeadingPlugin, HEADING_KEYS } from '@udecode/plate-heading';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { MarkdownPlugin } from '@udecode/plate-markdown';

import {
  TodoLiStatic,
  TodoMarkerStatic,
} from '@/components/plate-ui/indent-todo-marker-static';

import { BlockquoteElementStatic } from './blockquote-element-static';
import { CodeBlockElementStatic } from './code-block-element-static';
import { CodeLeafStatic } from './code-leaf-static';
import { CodeLineElementStatic } from './code-line-element-static';
import { CodeSyntaxLeafStatic } from './code-syntax-leaf-static';
import { EditorStatic } from './editor-static';
import { HeadingElementStatic } from './heading-element-static';
import { HrElementStatic } from './hr-element-static';
import { LinkElementStatic } from './link-element-static';
import { ParagraphElementStatic } from './paragraph-element-static';

const components = {
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 's' }),
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
};

const plugins = [
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodePlugin,
  BaseCodeSyntaxPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseLinkPlugin,
  BaseParagraphPlugin,
  BaseIndentPlugin.extend({
    inject: {
      targetPlugins: [BaseParagraphPlugin.key],
    },
  }),
  BaseIndentListPlugin.extend({
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
  MarkdownPlugin.configure({ options: { indentList: true } }),
];

export const AIChatEditor = memo(({ content }: { content: string }) => {
  const aiEditor = usePlateEditor({
    plugins,
  });

  useAIChatEditor(aiEditor, content);

  return (
    <EditorStatic variant="aiChat" components={components} editor={aiEditor} />
  );
});
