import { memo } from 'react';

import { cn, withProps } from '@udecode/cn';
import { type AIPluginConfig, AIPlugin } from '@udecode/plate-ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import {
  ParagraphPlugin,
  Plate,
  createPlateEditor,
  useEditorPlugin,
} from '@udecode/plate-core/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { PlateLeaf } from '@udecode/plate-utils/react';
import Prism from 'prismjs';

import { CodeBlockElement } from './code-block-element';
import { CodeLeaf } from './code-leaf';
import { CodeLineElement } from './code-line-element';
import { CodeSyntaxLeaf } from './code-syntax-leaf';
import { Editor } from './editor';
import { HeadingElement } from './heading-element';
import { HrElement } from './hr-element';
import { LinkElement } from './link-element';
import { LinkFloatingToolbar } from './link-floating-toolbar';
import { ParagraphElement } from './paragraph-element';

interface props {
  className?: string;
}

// eslint-disable-next-line react/display-name
export const AIPreviewEditor = memo(({ className }: props) => {
  const { editor } = useEditorPlugin<AIPluginConfig>(AIPlugin);
  const { aiEditor } = editor.useOptions(AIPlugin);

  return (
    <Plate editor={aiEditor}>
      <Editor
        className={cn(
          'max-h-none min-h-0 max-w-[708px] rounded-b-none border border-b-0 p-2',
          'w-full px-0',
          className
        )}
        readOnly
      ></Editor>
    </Plate>
  );
});

export const createAIEditor = () => {
  const editor = createPlateEditor({
    id: 'ai-minimal-editor',
    override: {
      components: {
        [CodeBlockPlugin.key]: CodeBlockElement,
        [CodeLinePlugin.key]: CodeLineElement,
        [CodePlugin.key]: CodeLeaf,
        [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
        [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
        [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
        [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
        [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
        [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
        [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
        [HorizontalRulePlugin.key]: HrElement,
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
        [LinkPlugin.key]: LinkElement,
        [ParagraphPlugin.key]: ParagraphElement,
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
        [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
      },
    },
    plugins: [
      ParagraphPlugin,
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
          ],
        },
      }),
      IndentListPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            HEADING_KEYS.h1,
            HEADING_KEYS.h2,
            HEADING_KEYS.h3,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
          ],
        },
      }),
      HeadingPlugin.configure({ options: { levels: 3 } }),
      BlockquotePlugin,
      CodeBlockPlugin.configure({ options: { prism: Prism } }),
      HorizontalRulePlugin,
      LinkPlugin.configure({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
      MarkdownPlugin.configure({ options: { indentList: true } }),
      // FIXME: Fixed the throw error: BlockSelectionPlugin is missing. readonly editor need'nt this plugin so using an empty plugin instead
      BlockSelectionPlugin.configure({
        api: {},
        extendEditor: null,
        options: {},
        render: {},
        useHooks: null,
        handlers: {},
      }),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      SubscriptPlugin,
      SuperscriptPlugin,
      FontColorPlugin,
      FontBackgroundColorPlugin,
      FontSizePlugin,
      HighlightPlugin,
      KbdPlugin,
    ],
    value: [{ children: [{ text: '' }], type: 'p' }],
  });

  return editor;
};
