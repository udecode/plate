'use client';

import React, { useRef } from 'react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import {
  ELEMENT_BLOCKQUOTE,
  createBlockquotePlugin,
} from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
  createCodeBlockPlugin,
} from '@udecode/plate-code-block';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import {
  CommentsProvider,
  MARK_COMMENT,
  createCommentsPlugin,
} from '@udecode/plate-comments';
import {
  Plate,
  PlateLeaf,
  PlateProvider,
  createPlugins,
} from '@udecode/plate-common';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createEmojiPlugin } from '@udecode/plate-emoji';
import {
  ELEMENT_EXCALIDRAW,
  createExcalidrawPlugin,
} from '@udecode/plate-excalidraw';
import { MARK_SEARCH_HIGHLIGHT } from '@udecode/plate-find-replace';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
} from '@udecode/plate-font';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  createHeadingPlugin,
} from '@udecode/plate-heading';
import {
  MARK_HIGHLIGHT,
  createHighlightPlugin,
} from '@udecode/plate-highlight';
import {
  ELEMENT_HR,
  createHorizontalRulePlugin,
} from '@udecode/plate-horizontal-rule';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createJuicePlugin } from '@udecode/plate-juice';
import { MARK_KBD, createKbdPlugin } from '@udecode/plate-kbd';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { ELEMENT_LINK, createLinkPlugin } from '@udecode/plate-link';
import {
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  createTodoListPlugin,
} from '@udecode/plate-list';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import {
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
  createMentionPlugin,
} from '@udecode/plate-mention';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  createTablePlugin,
} from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { withProps } from '@udecode/plate-utils';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { alignPlugin } from '@/lib/plate/alignPlugin';
import { autoformatPlugin } from '@/lib/plate/autoformatPlugin';
import { dragOverCursorPlugin } from '@/lib/plate/dragOverCursorPlugin';
import { emojiPlugin } from '@/lib/plate/emojiPlugin';
import { exitBreakPlugin } from '@/lib/plate/exitBreakPlugin';
import { indentPlugin } from '@/lib/plate/indentPlugin';
import { lineHeightPlugin } from '@/lib/plate/lineHeightPlugin';
import { linkPlugin } from '@/lib/plate/linkPlugin';
import { MENTIONABLES } from '@/lib/plate/mentionables';
import { resetBlockTypePlugin } from '@/lib/plate/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/lib/plate/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/lib/plate/softBreakPlugin';
import { tabbablePlugin } from '@/lib/plate/tabbablePlugin';
import { trailingBlockPlugin } from '@/lib/plate/trailingBlockPlugin';
import { cn } from '@/lib/utils';
import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/components/plate-ui/code-block-element';
import { CodeLeaf } from '@/components/plate-ui/code-leaf';
import { CodeLineElement } from '@/components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/components/plate-ui/code-syntax-leaf';
import { CommentLeaf } from '@/components/plate-ui/comment-leaf';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { ExcalidrawElement } from '@/components/plate-ui/excalidraw-element';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { KbdLeaf } from '@/components/plate-ui/kbd-leaf';
import { LinkElement } from '@/components/plate-ui/link-element';
import { ListElement } from '@/components/plate-ui/list-element';
import { MediaEmbedElement } from '@/components/plate-ui/media-embed-element';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';
import { MentionElement } from '@/components/plate-ui/mention-element';
import { MentionInputElement } from '@/components/plate-ui/mention-input-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { withPlaceholders } from '@/components/plate-ui/placeholder';
import { SearchHighlightLeaf } from '@/components/plate-ui/search-highlight-leaf';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/plate-ui/table-cell-element';
import { TableElement } from '@/components/plate-ui/table-element';
import { TableRowElement } from '@/components/plate-ui/table-row-element';
import { TodoListElement } from '@/components/plate-ui/todo-list-element';

const plugins = createPlugins(
  [
    // Nodes
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHorizontalRulePlugin(),
    createLinkPlugin(linkPlugin),
    createImagePlugin(),
    createMediaEmbedPlugin(),
    createMentionPlugin(),
    createTablePlugin(),
    createTodoListPlugin(),
    createExcalidrawPlugin(),
    //
    // // Marks
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
    createHighlightPlugin(),
    createKbdPlugin(),
    //
    // // Block Style
    createAlignPlugin(alignPlugin),
    createIndentPlugin(indentPlugin),
    createIndentListPlugin(),
    createLineHeightPlugin(lineHeightPlugin),
    //
    // // Functionality
    createAutoformatPlugin(autoformatPlugin),
    createBlockSelectionPlugin({
      options: {
        sizes: {
          top: 0,
          bottom: 0,
        },
      },
    }),
    createComboboxPlugin(),
    createDndPlugin({
      options: { enableScroller: true },
    }),
    createEmojiPlugin(emojiPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createNodeIdPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createTabbablePlugin(tabbablePlugin),
    createTrailingBlockPlugin(trailingBlockPlugin),
    dragOverCursorPlugin,
    //
    // // Collaboration
    createCommentsPlugin(),
    //
    // // Deserialization
    createDeserializeDocxPlugin(),
    createDeserializeMdPlugin(),
    createJuicePlugin(),
  ],
  {
    components: withPlaceholders({
      [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [ELEMENT_CODE_LINE]: CodeLineElement,
      [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
      [ELEMENT_HR]: HrElement,
      [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
      [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
      [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
      [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
      [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
      [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
      [ELEMENT_IMAGE]: ImageElement,
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
      [ELEMENT_MENTION]: MentionElement,
      [ELEMENT_MENTION_INPUT]: MentionInputElement,
      [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
      [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [ELEMENT_TABLE]: TableElement,
      [ELEMENT_TD]: TableCellElement,
      [ELEMENT_TH]: TableCellHeaderElement,
      [ELEMENT_TODO_LI]: TodoListElement,
      [ELEMENT_TR]: TableRowElement,
      [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_CODE]: CodeLeaf,
      [MARK_HIGHLIGHT]: HighlightLeaf,
      [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
      [MARK_KBD]: KbdLeaf,
      [MARK_SEARCH_HIGHLIGHT]: SearchHighlightLeaf,
      [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
      [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
      [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
      [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
      [MARK_COMMENT]: CommentLeaf,
    }),
  }
);

export default function Editor() {
  const containerRef = useRef(null);

  const initialValue = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Hello, World!' }],
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <PlateProvider plugins={plugins} initialValue={initialValue}>
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <div className="flex">
            <CommentsProvider>
              <div
                ref={containerRef}
                className={cn(
                  'relative flex max-w-[900px] overflow-x-auto',
                  '[&_.slate-start-area-top]:!h-4',
                  '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px]'
                )}
              >
                <Plate
                  editableProps={{
                    autoFocus: true,
                    className: cn(
                      'relative max-w-full leading-[1.4] outline-none [&_strong]:font-bold',
                      '!min-h-[600px] w-[900px] px-[96px] py-16'
                    ),
                  }}
                >
                  <FloatingToolbar>
                    <FloatingToolbarButtons />
                  </FloatingToolbar>

                  <MentionCombobox items={MENTIONABLES} />

                  <CursorOverlay containerRef={containerRef} />
                </Plate>
              </div>

              <CommentsPopover />
            </CommentsProvider>
          </div>
        </PlateProvider>
      </div>
    </DndProvider>
  );
}
