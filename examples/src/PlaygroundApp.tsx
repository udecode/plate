import React, { CSSProperties, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AutoformatPlugin,
  CodeBlockElement,
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
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createPlateUI,
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
  MentionCombobox,
  Plate,
  PlateFloatingComments,
  PlateProvider,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw';
import { alignPlugin } from './align/alignPlugin';
import { autoformatPlugin } from './autoformat/autoformatPlugin';
import { CommentBalloonToolbar } from './comments/CommentBalloonToolbar';
import { MyCommentsProvider } from './comments/MyCommentsProvider';
import { editableProps } from './common/editableProps';
import { CursorOverlayContainer } from './cursor-overlay/CursorOverlayContainer';
import { dragOverCursorPlugin } from './cursor-overlay/dragOverCursorPlugin';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { emojiPlugin } from './emoji/emojiPlugin';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { forcedLayoutPlugin } from './forced-layout/forcedLayoutPlugin';
import { indentPlugin } from './indent/indentPlugin';
import { linkPlugin } from './link/linkPlugin';
import { MENTIONABLES } from './mention/mentionables';
import { withStyledPlaceHolders } from './placeholder/withStyledPlaceHolders';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from './select-on-backspace/selectOnBackspacePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { Toolbar } from './toolbar/Toolbar';
import { trailingBlockPlugin } from './trailing-block/trailingBlockPlugin';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from './typescript/plateTypes';
import { playgroundValue } from './playgroundValue';
import { ToolbarButtons } from './ToolbarButtons';

let components = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  // customize your components by plugin key
});
components = withStyledPlaceHolders(components);

const styles: Record<string, CSSProperties> = {
  container: { position: 'relative' },
};

const App = () => {
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
          createDeserializeMdPlugin(),
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
        <Toolbar>
          <ToolbarButtons />
        </Toolbar>

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
};

export default App;
