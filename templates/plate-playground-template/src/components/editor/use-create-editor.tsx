import React from 'react';

import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
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
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import {
  ParagraphPlugin,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiInputPlugin, EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';
import {
  SlashInputPlugin,
  SlashPlugin,
} from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import Prism from 'prismjs';

import { aiPlugins } from '@/components/editor/plugins/ai-plugins';
import { autoformatPlugin } from '@/components/editor/plugins/autoformat-plugin';
import { copilotPlugins } from '@/components/editor/plugins/copilot-plugins';
import { AILeaf } from '@/components/plate-ui/ai-leaf';
import { BlockContextMenu } from '@/components/plate-ui/block-context-menu';
import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/components/plate-ui/code-block-element';
import { CodeLeaf } from '@/components/plate-ui/code-leaf';
import { CodeLineElement } from '@/components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/components/plate-ui/code-syntax-leaf';
import { ColumnElement } from '@/components/plate-ui/column-element';
import { ColumnGroupElement } from '@/components/plate-ui/column-group-element';
import { CommentLeaf } from '@/components/plate-ui/comment-leaf';
import { DragOverCursorPlugin } from '@/components/plate-ui/cursor-overlay';
import { DateElement } from '@/components/plate-ui/date-element';
import { EmojiInputElement } from '@/components/plate-ui/emoji-input-element';
import { ExcalidrawElement } from '@/components/plate-ui/excalidraw-element';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { ImagePreview } from '@/components/plate-ui/image-preview';
import {
  TodoLi,
  TodoMarker,
} from '@/components/plate-ui/indent-todo-marker';
import { KbdLeaf } from '@/components/plate-ui/kbd-leaf';
import { LinkElement } from '@/components/plate-ui/link-element';
import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';
import { ListElement } from '@/components/plate-ui/list-element';
import { MediaEmbedElement } from '@/components/plate-ui/media-embed-element';
import { MentionElement } from '@/components/plate-ui/mention-element';
import { MentionInputElement } from '@/components/plate-ui/mention-input-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { withPlaceholders } from '@/components/plate-ui/placeholder';
import { SlashInputElement } from '@/components/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/plate-ui/table-cell-element';
import { TableElement } from '@/components/plate-ui/table-element';
import { TableRowElement } from '@/components/plate-ui/table-row-element';
import { TocElement } from '@/components/plate-ui/toc-element';
import { ToggleElement } from '@/components/plate-ui/toggle-element';
import { withDraggables } from '@/components/plate-ui/with-draggables';

export const useCreateEditor = () => {
  return usePlateEditor({
    override: {
      components: withDraggables(
        withPlaceholders({
          [AIPlugin.key]: AILeaf,
          [BlockquotePlugin.key]: BlockquoteElement,
          [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
          [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
          [CodeBlockPlugin.key]: CodeBlockElement,
          [CodeLinePlugin.key]: CodeLineElement,
          [CodePlugin.key]: CodeLeaf,
          [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
          [ColumnItemPlugin.key]: ColumnElement,
          [ColumnPlugin.key]: ColumnGroupElement,
          [CommentsPlugin.key]: CommentLeaf,
          [DatePlugin.key]: DateElement,
          [EmojiInputPlugin.key]: EmojiInputElement,
          [ExcalidrawPlugin.key]: ExcalidrawElement,
          [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
          [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
          [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
          [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
          [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
          [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
          [HighlightPlugin.key]: HighlightLeaf,
          [HorizontalRulePlugin.key]: HrElement,
          [ImagePlugin.key]: ImageElement,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [KbdPlugin.key]: KbdLeaf,
          [LinkPlugin.key]: LinkElement,
          [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
          [MediaEmbedPlugin.key]: MediaEmbedElement,
          [MentionInputPlugin.key]: MentionInputElement,
          [MentionPlugin.key]: MentionElement,
          [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
          [ParagraphPlugin.key]: ParagraphElement,
          [SlashInputPlugin.key]: SlashInputElement,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
          [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
          [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          [TableCellPlugin.key]: TableCellElement,
          [TablePlugin.key]: TableElement,
          [TableRowPlugin.key]: TableRowElement,
          [TocPlugin.key]: TocElement,
          [TogglePlugin.key]: ToggleElement,
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        })
      ),
    },
    plugins: [
      // AI
      ...aiPlugins,
      ...copilotPlugins,
      // Nodes
      HeadingPlugin,
      TocPlugin.configure({
        options: {
          scrollContainerSelector: `#scroll_container`,
          topOffset: 80,
        },
      }),
      BlockquotePlugin,
      CodeBlockPlugin.configure({
        options: {
          prism: Prism,
        },
      }),
      HorizontalRulePlugin,
      LinkPlugin.configure({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
      ImagePlugin.extend({
        render: { afterEditable: ImagePreview },
      }),
      MediaEmbedPlugin,
      CaptionPlugin.configure({
        options: { plugins: [ImagePlugin, MediaEmbedPlugin] },
      }),
      DatePlugin,
      MentionPlugin.configure({
        options: {
          triggerPreviousCharPattern: /^$|^[\s"']$/,
        },
      }),
      SlashPlugin,
      TablePlugin.configure({
        options: {
          enableMerging: true,
        },
      }),
      ColumnPlugin,

      TodoListPlugin,
      TogglePlugin,
      ExcalidrawPlugin,
      // Marks
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

      // Block Style
      AlignPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            MediaEmbedPlugin.key,
            ImagePlugin.key,
            ...HEADING_LEVELS,
          ],
        },
      }),
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
            ...HEADING_LEVELS,
          ],
        },
      }),
      IndentListPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
            ...HEADING_LEVELS,
          ],
        },
        options: {
          listStyleTypes: {
            todo: {
              liComponent: TodoLi,
              markerComponent: TodoMarker,
              type: 'todo',
            },
          },
        },
      }),
      LineHeightPlugin.configure({
        inject: {
          nodeProps: {
            defaultNodeValue: 1.5,
            validNodeValues: [1, 1.2, 1.5, 2, 3],
          },
          targetPlugins: [ParagraphPlugin.key, ...HEADING_LEVELS],
        },
      }),

      // Functionality
      autoformatPlugin,
      BlockSelectionPlugin.configure({
        options: {
          areaOptions: {
            behaviour: {
              scrolling: {
                speedDivider: 1.5,
              },
              startThreshold: 10,
            },
            boundaries: `#scroll_container`,
            container: `#scroll_container`,
            selectables: [`#scroll_container .slate-selectable`],
            selectionAreaClass: 'slate-selection-area',
          },
          enableContextMenu: true,
        },
      }),
      BlockMenuPlugin.configure({
        render: { aboveEditable: BlockContextMenu },
      }),
      DndPlugin.configure({
        options: { enableScroller: true },
      }),
      EmojiPlugin,
      ExitBreakPlugin.configure({
        options: {
          rules: [
            {
              hotkey: 'mod+enter',
            },
            {
              before: true,
              hotkey: 'mod+shift+enter',
            },
            {
              hotkey: 'enter',
              level: 1,
              query: {
                allow: HEADING_LEVELS,
                end: true,
                start: true,
              },
              relative: true,
            },
          ],
        },
      }),
      NodeIdPlugin,
      ResetNodePlugin.configure({
        options: {
          rules: [
            {
              defaultType: ParagraphPlugin.key,
              hotkey: 'Enter',
              predicate: isBlockAboveEmpty,
              types: [BlockquotePlugin.key, TodoListPlugin.key],
            },
            {
              defaultType: ParagraphPlugin.key,
              hotkey: 'Backspace',
              predicate: isSelectionAtBlockStart,
              types: [BlockquotePlugin.key, TodoListPlugin.key],
            },
            {
              defaultType: ParagraphPlugin.key,
              hotkey: 'Enter',
              predicate: isCodeBlockEmpty,
              types: [CodeBlockPlugin.key],
              onReset: unwrapCodeBlock,
            },
            {
              defaultType: ParagraphPlugin.key,
              hotkey: 'Backspace',
              predicate: isSelectionAtCodeBlockStart,
              types: [CodeBlockPlugin.key],
              onReset: unwrapCodeBlock,
            },
          ],
        },
      }),
      SelectOnBackspacePlugin.configure({
        options: {
          query: {
            allow: [ImagePlugin.key, HorizontalRulePlugin.key],
          },
        },
      }),
      SoftBreakPlugin.configure({
        options: {
          rules: [
            { hotkey: 'shift+enter' },
            {
              hotkey: 'enter',
              query: {
                allow: [
                  CodeBlockPlugin.key,
                  BlockquotePlugin.key,
                  TableCellPlugin.key,
                  TableCellHeaderPlugin.key,
                ],
              },
            },
          ],
        },
      }),
      TabbablePlugin.configure(({ editor }) => ({
        options: {
          query: () => {
            if (isSelectionAtBlockStart(editor)) return false;

            return !someNode(editor, {
              match: (n) => {
                return !!(
                  n.type &&
                  ([
                    CodeBlockPlugin.key,
                    TablePlugin.key,
                    TodoListPlugin.key,
                  ].includes(n.type as string) ||
                    n.listStyleType)
                );
              },
            });
          },
        },
      })),
      TrailingBlockPlugin.configure({
        options: { type: ParagraphPlugin.key },
      }),

      // Collaboration
      DragOverCursorPlugin,
      CommentsPlugin.configure({
        options: {
          myUserId: '1',
          users: {
            1: {
              id: '1',
              avatarUrl:
                'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
              name: 'zbeyens',
            },
          },
        },
      }),

      // Deserialization
      DocxPlugin,
      MarkdownPlugin.configure({ options: { indentList: true } }),
      JuicePlugin,
    ],
    value: [
      {
        id: '1',
        children: [{ text: 'Playground' }],
        type: 'h1',
      },
      {
        id: '2',
        children: [
          { text: 'A rich-text editor with AI capabilities. Try the ' },
          { bold: true, text: 'AI commands' },
          { text: ' or use ' },
          { kbd: true, text: 'Cmd+J' },
          { text: ' to open the AI menu.' },
        ],
        type: ParagraphPlugin.key,
      },
    ],
  });
};
