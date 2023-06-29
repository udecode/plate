'use client';

import React, { useRef } from 'react';
import { Plate, PlateProvider, createPlugins } from '@udecode/plate-common';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { cn } from '@/lib/utils';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';

const plugins = createPlugins(
  [
    // Nodes
    createParagraphPlugin(),
    // createHeadingPlugin(),
    // createBlockquotePlugin(),
    // createCodeBlockPlugin(),
    // createHorizontalRulePlugin(),
    // createLinkPlugin(linkPlugin),
    // createImagePlugin(),
    // createMediaEmbedPlugin(),
    // createMentionPlugin(),
    // createTablePlugin(),
    // createTodoListPlugin(),
    // createExcalidrawPlugin(),
    //
    // // Marks
    // createBoldPlugin(),
    // createItalicPlugin(),
    // createUnderlinePlugin(),
    // createStrikethroughPlugin(),
    // createCodePlugin(),
    // createSubscriptPlugin(),
    // createSuperscriptPlugin(),
    // createFontColorPlugin(),
    // createFontBackgroundColorPlugin(),
    // createFontSizePlugin(),
    // createHighlightPlugin(),
    // createKbdPlugin(),
    //
    // // Block Style
    // createAlignPlugin(alignPlugin),
    // createIndentPlugin(indentPlugin),
    // createIndentListPlugin(),
    // createLineHeightPlugin(lineHeightPlugin),
    //
    // // Functionality
    // createAutoformatPlugin(autoformatPlugin),
    // createBlockSelectionPlugin({
    //   options: {
    //     sizes: {
    //       top: 0,
    //       bottom: 0,
    //     },
    //   },
    // }),
    // createComboboxPlugin(),
    // createDndPlugin({
    //   options: { enableScroller: true },
    // }),
    // createEmojiPlugin(emojiPlugin),
    // createExitBreakPlugin(exitBreakPlugin),
    // createNodeIdPlugin(),
    // createResetNodePlugin(resetBlockTypePlugin),
    // createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    // createSoftBreakPlugin(softBreakPlugin),
    // createTabbablePlugin(tabbablePlugin),
    // createTrailingBlockPlugin(trailingBlockPlugin),
    // dragOverCursorPlugin,
    //
    // // Collaboration
    // createCommentsPlugin(),
    //
    // // Deserialization
    // createDeserializeDocxPlugin(),
    // createDeserializeMdPlugin( ),
    // createJuicePlugin(),
  ],
  {
    components:
      // withDraggables(
      // withPlaceholders(
      {
        // [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
        // [ELEMENT_CODE_BLOCK]: CodeBlockElement,
        // [ELEMENT_CODE_LINE]: CodeLineElement,
        // [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
        // [ELEMENT_HR]: HrElement,
        // [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
        // [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
        // [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
        // [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
        // [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
        // [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
        // [ELEMENT_IMAGE]: ImageElement,
        // [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
        // [ELEMENT_LINK]: LinkElement,
        // [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
        // [ELEMENT_MENTION]: MentionElement,
        // [ELEMENT_MENTION_INPUT]: MentionInputElement,
        // [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
        // [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
        [ELEMENT_PARAGRAPH]: ParagraphElement,
        // [ELEMENT_TABLE]: TableElement,
        // [ELEMENT_TD]: TableCellElement,
        // [ELEMENT_TH]: TableCellHeaderElement,
        // [ELEMENT_TODO_LI]: TodoListElement,
        // [ELEMENT_TR]: TableRowElement,
        // [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
        // [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
        // [MARK_CODE]: CodeLeaf,
        // [MARK_HIGHLIGHT]: HighlightLeaf,
        // [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
        // [MARK_KBD]: KbdLeaf,
        // [MARK_SEARCH_HIGHLIGHT]: SearchHighlightLeaf,
        // [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
        // [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
        // [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
        // [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
        // [MARK_COMMENT]: CommentLeaf,
      },
    //   )
    // )
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
          {/*<FixedToolbar>*/}
          {/*  <FixedToolbarButtons />*/}
          {/*</FixedToolbar>*/}

          <div className="flex">
            {/*<CommentsProvider>*/}
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
                {/*<FloatingToolbar>*/}
                {/*  <FloatingToolbarButtons id={id} />*/}
                {/*</FloatingToolbar>*/}

                {/*<MentionCombobox items={MENTIONABLES} />*/}

                {/*<CursorOverlay containerRef={containerRef} />*/}
              </Plate>
            </div>

            {/*<CommentsPopover />*/}
            {/*</CommentsProvider>*/}
          </div>
        </PlateProvider>
      </div>
    </DndProvider>
  );
}
