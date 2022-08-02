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
  createDeserializeCsvPlugin,
  createDeserializeDocxPlugin,
  createDeserializeMdPlugin,
  createDndPlugin,
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
  StyledElement,
} from '@udecode/plate';
import { createJuicePlugin } from '@udecode/plate-juice';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw';
import { alignPlugin } from './align/alignPlugin';
import { autoformatPlugin } from './autoformat/autoformatPlugin';
import { MarkBalloonToolbar } from './balloon-toolbar/MarkBalloonToolbar';
import { editableProps } from './common/editableProps';
import { CursorOverlayContainer } from './cursor-overlay/CursorOverlayContainer';
import { dragOverCursorPlugin } from './cursor-overlay/dragOverCursorPlugin';
import { withStyledDraggables } from './dnd/withStyledDraggables';
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
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  [ELEMENT_CODE_BLOCK]: StyledElement,
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
          createDndPlugin(),
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
          createDeserializeMdPlugin(),
          createDeserializeCsvPlugin(),
          createDeserializeDocxPlugin(),
          createJuicePlugin() as MyPlatePlugin,
        ],
        {
          components: withStyledDraggables(components),
        }
      ),
    []
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Toolbar>
        <ToolbarButtons />
      </Toolbar>

      <div ref={containerRef} style={styles.container}>
        <Plate<MyValue, MyEditor>
          editableProps={editableProps}
          initialValue={playgroundValue}
          plugins={plugins}
        >
          <MarkBalloonToolbar />

          <MentionCombobox items={MENTIONABLES} />

          <CursorOverlayContainer containerRef={containerRef} />
        </Plate>
      </div>
    </DndProvider>
  );
};

export default App;
