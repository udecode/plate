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
  ELEMENT_CODE_BLOCK,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
} from '@udecode/plate-excalidraw';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';

import { createPlateUI } from '@/lib/createPlateUI';
import { CodeBlockElement } from '@/plate/code-block/CodeBlockElement';
import { FloatingCommentList } from '@/plate/comments/FloatingCommentList';
import { MyCommentsProvider } from '@/plate/comments/MyCommentsProvider';
import { CursorOverlayContainer } from '@/plate/cursor-overlay/CursorOverlayContainer';
import { editableProps } from '@/plate/demo/editableProps';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/plate/demo/plate.types';
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
import { withDraggables } from '@/plate/dnd/withDraggables';
import { ExcalidrawElement } from '@/plate/excalidraw/ExcalidrawElement';
import { MentionCombobox } from '@/plate/mention/MentionCombobox';
import { withPlaceHolders } from '@/plate/placeholder/withPlaceHolders';
import { FloatingToolbar } from '@/plate/toolbar/FloatingToolbar';
import { FloatingToolbarButtons } from '@/plate/toolbar/FloatingToolbarButtons';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { HeadingToolbarButtons } from '@/plate/toolbar/HeadingToolbarButtons';

let components = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  // customize your components by plugin key
});
components = withPlaceHolders(components);

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

      <MyCommentsProvider>
        <div ref={containerRef} className="relative">
          <Plate editableProps={editableProps}>
            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <MentionCombobox items={MENTIONABLES} />

            <CursorOverlayContainer containerRef={containerRef} />
          </Plate>
        </div>

        <FloatingCommentList />
      </MyCommentsProvider>
    </PlateProvider>
  );
}
