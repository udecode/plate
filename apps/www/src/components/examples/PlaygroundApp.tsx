'use client';

import React, { CSSProperties, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  createIndentPlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLineHeightPlugin,
  createLinkPlugin,
  createListPlugin,
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
import { playgroundValue } from './playgroundValue';
import { ToolbarButtons } from './ToolbarButtons';

import { createPlateUI } from '@/lib/createPlateUI';
import { alignPlugin } from '@/plate/align/alignPlugin';
import { autoformatPlugin } from '@/plate/autoformat/autoformatPlugin';
import { CodeBlockElement } from '@/plate/code-block/CodeBlockElement';
import { CommentBalloonToolbar } from '@/plate/comments/CommentBalloonToolbar';
import { MyCommentsProvider } from '@/plate/comments/MyCommentsProvider';
import { PlateFloatingComments } from '@/plate/comments/PlateFloatingComments';
import { editableProps } from '@/plate/common/editableProps';
import { CursorOverlayContainer } from '@/plate/cursor-overlay/CursorOverlayContainer';
import { dragOverCursorPlugin } from '@/plate/cursor-overlay/dragOverCursorPlugin';
import { withStyledDraggables } from '@/plate/dnd/withStyledDraggables';
import { emojiPlugin } from '@/plate/emoji/emojiPlugin';
import { ExcalidrawElement } from '@/plate/excalidraw/ExcalidrawElement';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/forced-layout/forcedLayoutPlugin';
import { indentPlugin } from '@/plate/indent/indentPlugin';
import { lineHeightPlugin } from '@/plate/line-height/lineHeightPlugin';
import { linkPlugin } from '@/plate/link/linkPlugin';
import { MENTIONABLES } from '@/plate/mention/mentionables';
import { MentionCombobox } from '@/plate/mention/MentionCombobox';
import { withStyledPlaceHolders } from '@/plate/placeholder/withStyledPlaceHolders';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/select-on-backspace/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { trailingBlockPlugin } from '@/plate/trailing-block/trailingBlockPlugin';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/plate/typescript/plateTypes';

let components = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  // customize your components by plugin key
});
components = withStyledPlaceHolders(components);

const styles: Record<string, CSSProperties> = {
  container: { position: 'relative' },
};

function App() {
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
          createListPlugin(),
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
          createDeserializeMdPlugin() as MyPlatePlugin,
          createDeserializeCsvPlugin(),
          createDeserializeDocxPlugin(),
          createJuicePlugin() as MyPlatePlugin,
          createEmojiPlugin(emojiPlugin),
        ],
        {
          components: withStyledDraggables(components),
        }
      ),
    []
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <PlateProvider<MyValue> initialValue={playgroundValue} plugins={plugins}>
        <HeadingToolbar>
          <ToolbarButtons />
        </HeadingToolbar>

        <MyCommentsProvider>
          <div ref={containerRef} style={styles.container}>
            <Plate editableProps={editableProps}>
              <CommentBalloonToolbar />

              <MentionCombobox items={MENTIONABLES} />

              <CursorOverlayContainer containerRef={containerRef} />
            </Plate>
          </div>

          <PlateFloatingComments />
        </MyCommentsProvider>
      </PlateProvider>
    </DndProvider>
  );
}

export default App;
