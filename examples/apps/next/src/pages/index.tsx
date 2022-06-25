import React, { useMemo, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { CursorOverlayContainer } from '@udecode/examples/src/config/components/CursorOverlayContainer'
import {
  MarkBallonToolbar,
  ToolbarButtons,
} from '@udecode/examples/src/config/components/Toolbars'
import { withStyledDraggables } from '@udecode/examples/src/config/components/withStyledDraggables'
import { withStyledPlaceHolders } from '@udecode/examples/src/config/components/withStyledPlaceHolders'
import { CONFIG } from '@udecode/examples/src/config/config'
import { MENTIONABLES } from '@udecode/examples/src/config/mentionables'
import { createDragOverCursorPlugin } from '@udecode/examples/src/config/plugins'
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@udecode/examples/src/config/typescript'
import { VALUES } from '@udecode/examples/src/config/values/values'
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
} from '@udecode/plate'
import { createJuicePlugin } from '@udecode/plate-juice'
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw'

const id = 'Examples/Playground'

let components = createPlateUI({
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  [ELEMENT_CODE_BLOCK]: StyledElement,
  // customize your components by plugin key
})
components = withStyledPlaceHolders(components)

const Plugins = () => {
  const containerRef = useRef(null)

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
          createAlignPlugin(CONFIG.align),
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
          createDragOverCursorPlugin(),
          createIndentPlugin(CONFIG.indent),
          createAutoformatPlugin<
            AutoformatPlugin<MyValue, MyEditor>,
            MyValue,
            MyEditor
          >(CONFIG.autoformat),
          createResetNodePlugin(CONFIG.resetBlockType),
          createSoftBreakPlugin(CONFIG.softBreak),
          createExitBreakPlugin(CONFIG.exitBreak),
          createNormalizeTypesPlugin(CONFIG.forceLayout),
          createTrailingBlockPlugin(CONFIG.trailingBlock),
          createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
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
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <PlateEventProvider>
        <HeadingToolbar>
          <ToolbarButtons />
        </HeadingToolbar>
      </PlateEventProvider>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <Plate<MyValue, MyEditor>
          id={id}
          editableProps={CONFIG.editableProps}
          initialValue={VALUES.playground}
          plugins={plugins}
        >
          <MarkBallonToolbar />

          <MentionCombobox items={MENTIONABLES} />

          <CursorOverlayContainer containerRef={containerRef} />
        </Plate>
      </div>
    </DndProvider>
  )
}

export default Plugins
