'use client';

import React, { useMemo, useRef } from 'react';
import {
  AutoformatPlugin,
  createAlignPlugin,
  createAutoformatPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createComboboxPlugin,
  createCommentsPlugin,
  createDeserializeCsvPlugin,
  createDeserializeDocxPlugin,
  createDeserializeMdPlugin,
  createEmojiPlugin,
  createExitBreakPlugin,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHorizontalRulePlugin,
  createImagePlugin,
  createIndentListPlugin,
  createIndentPlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLineHeightPlugin,
  createLinkPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSoftBreakPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTabbablePlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';

import { FloatingToolbar } from '@/plate/aui/floating-toolbar';
import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { MentionCombobox } from '@/plate/aui/mention-combobox';
import { withPlaceHolders } from '@/plate/aui/placeholder';
import { withDraggables } from '@/plate/aui/with-draggables';
import { CommentsProvider } from '@/plate/bcomponents/comments/CommentsProvider';
import { FloatingComments } from '@/plate/bcomponents/comments/FloatingComments';
import { CursorOverlay } from '@/plate/bcomponents/cursor-overlay';
import { FloatingToolbarButtons } from '@/plate/bcomponents/floating-toolbar-buttons';
import { HeadingToolbarButtons } from '@/plate/bcomponents/heading-toolbar-buttons';
import { createPlateUI } from '@/plate/createPlateUI';
import { editableProps } from '@/plate/demo/editableProps';
import { alignPlugin } from '@/plate/demo/plugins/alignPlugin';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { dragOverCursorPlugin } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { emojiPlugin } from '@/plate/demo/plugins/emojiPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/demo/plugins/forcedLayoutPlugin';
import { indentPlugin } from '@/plate/demo/plugins/indentPlugin';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/demo/plugins/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tabbablePlugin } from '@/plate/demo/plugins/tabbablePlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { MENTIONABLES } from '@/plate/demo/values/mentionables';
import { playgroundValue } from '@/plate/demo/values/playgroundValue';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/types/plate.types';

const components = withPlaceHolders(createPlateUI());

export function PlaygroundDemo() {
  const containerRef = useRef(null);

  const plugins = useMemo(
    () =>
      createMyPlugins(
        [
          createParagraphPlugin(),
          createBlockquotePlugin(),
          createTodoListPlugin(),
          createHeadingPlugin(),
          createImagePlugin(),
          createHorizontalRulePlugin(),
          createLinkPlugin(linkPlugin),
          // Choose either "list" or "indent list" plugin
          // createListPlugin(),
          createIndentListPlugin(),
          createTablePlugin(),
          createMediaEmbedPlugin(),
          createExcalidrawPlugin() as MyPlatePlugin,
          createCodeBlockPlugin(),
          createAlignPlugin(alignPlugin),
          createBoldPlugin(),
          createCodePlugin(),
          createItalicPlugin(),
          createHighlightPlugin(),
          createUnderlinePlugin(),
          createStrikethroughPlugin(),
          createSubscriptPlugin(),
          createSuperscriptPlugin(),
          createFontColorPlugin(),
          createFontBackgroundColorPlugin(),
          createFontSizePlugin(),
          createLineHeightPlugin(lineHeightPlugin),
          createKbdPlugin(),
          createNodeIdPlugin(),
          createBlockSelectionPlugin(),
          createDndPlugin({ options: { enableScroller: true } }),
          dragOverCursorPlugin,
          createIndentPlugin(indentPlugin),
          createAutoformatPlugin<
            AutoformatPlugin<MyValue, MyEditor>,
            MyValue,
            MyEditor
          >(autoformatPlugin),
          createResetNodePlugin(resetBlockTypePlugin),
          createSoftBreakPlugin(softBreakPlugin),
          createExitBreakPlugin(exitBreakPlugin),
          createNormalizeTypesPlugin(forcedLayoutPlugin),
          createTrailingBlockPlugin(trailingBlockPlugin),
          createSelectOnBackspacePlugin(selectOnBackspacePlugin),
          createComboboxPlugin(),
          createMentionPlugin(),
          createCommentsPlugin(),
          createTabbablePlugin(tabbablePlugin),
          createDeserializeMdPlugin() as MyPlatePlugin,
          createDeserializeCsvPlugin(),
          createDeserializeDocxPlugin(),
          createJuicePlugin() as MyPlatePlugin,
          createEmojiPlugin(emojiPlugin),
        ],
        {
          components: withDraggables(components),
        }
      ),
    []
  );

  return (
    <PlateProvider<MyValue>
      initialValue={playgroundValue}
      plugins={plugins}
      normalizeInitialValue
    >
      <HeadingToolbar>
        <HeadingToolbarButtons />
      </HeadingToolbar>

      <CommentsProvider>
        <div ref={containerRef} className="relative">
          <Plate editableProps={editableProps}>
            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <MentionCombobox items={MENTIONABLES} />

            <CursorOverlay containerRef={containerRef} />
          </Plate>
        </div>

        <FloatingComments />
      </CommentsProvider>
    </PlateProvider>
  );
}
