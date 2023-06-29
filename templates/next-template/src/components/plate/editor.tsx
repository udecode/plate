'use client';

import React, { useRef } from 'react';
import { Plate, PlateProvider, createPlugins } from '@udecode/plate-common';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { createPlateUI } from '@/lib/plate/createPlateUI';
import { cn } from '@/lib/utils';

export default function Editor() {
  const containerRef = useRef(null);

  const initialValue = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Hello, World!' }],
    },
  ];

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
      components: createPlateUI(),
    }
  );

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
