export const playgroundAppCode = `import 'tippy.js/dist/tippy.css';
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
  HeadingToolbar,
  MentionCombobox,
  Plate,
  PlateEventProvider,
  StyledElement,
} from '@udecode/plate';
import { createJuicePlugin } from '@udecode/plate-juice';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw';
import { editableProps } from './common/editableProps';
import { alignPlugin } from './align';
import { autoformatPlugin } from './autoformat';
import { MarkBallonToolbar } from './balloon-toolbar';
import { CursorOverlayContainer, dragOverCursorPlugin } from './cursor-overlay';
import { withStyledDraggables } from './dnd';
import { exitBreakPlugin } from './exit-break';
import { forcedLayoutPlugin } from './forced-layout';
import { indentPlugin } from './indent';
import { MENTIONABLES } from './mention';
import { withStyledPlaceHolders } from './placeholder';
import { playgroundValue } from './playgroundValue';
import { resetBlockTypePlugin } from './reset-node';
import { selectOnBackspacePlugin } from './select-on-backspace';
import { softBreakPlugin } from './soft-break';
import { ToolbarButtons } from './ToolbarButtons';
import { trailingBlockPlugin } from './trailing-block';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from './typescript';

const id = 'Playground';

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
          createImagePlugin({
            type: 'image-block',
          }),
          createHorizontalRulePlugin(),
          createLinkPlugin(),
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
      <PlateEventProvider>
        <HeadingToolbar>
          <ToolbarButtons />
        </HeadingToolbar>
      </PlateEventProvider>

      <div ref={containerRef} style={styles.container}>
        <Plate<MyValue, MyEditor>
          id={id}
          editableProps={editableProps}
          initialValue={playgroundValue}
          plugins={plugins}
        >
          <MarkBallonToolbar />

          <MentionCombobox items={MENTIONABLES} />

          <CursorOverlayContainer containerRef={containerRef} />
        </Plate>
      </div>
    </DndProvider>
  );
};

export default App;
`;

export const playgroundAppFile = {
  '/PlaygroundApp.tsx': playgroundAppCode,
};
