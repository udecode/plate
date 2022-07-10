import React, { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AutoformatPlugin,
  Combobox,
  comboboxActions,
  ComboboxItemProps,
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
  isDefined,
  MentionCombobox,
  Plate,
  StyledElement,
  useComboboxSelectors,
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

export const COMBOBOX_TRIGGER_SLASH_COMMAND = '/';
export const COMBOBOX_KEY_SLASH_COMMAND = 'slash_command';

const COMMAND_BLOCK_ADD_PARAGRAPH = {
  id: 'block.add.paragraph',
  label: 'Block: Add Paragraph',
  inlineLabel: 'Paragraph',
  description: 'Plain text',
  keybinding: '⌘⏎',
};

const SlashCommandComboboxEffect = () => {
  const search = useComboboxSelectors.text();

  useEffect(() => {
    const commands = [COMMAND_BLOCK_ADD_PARAGRAPH, COMMAND_BLOCK_ADD_PARAGRAPH];

    const items = commands
      .map((item) => ({
        key: item.id,
        text: item.inlineLabel,
        data: {
          description: item.description,
          keybinding: item.keybinding,
        },
      }))
      .filter(
        (c) =>
          !isDefined(search) ||
          c.text?.toLowerCase().includes(search.toLowerCase())
      );

    comboboxActions.items(items);
  }, [search]);

  return null;
};

const SlashCommandComboboxItem = ({ item }: ComboboxItemProps<{}>) => {
  const data = item.data as any;

  return (
    <div className="inline-flex w-full p-2">
      <div className="flex w-full justify-between">
        <div className="flex-column">
          <div className="text-sm">{item.text}</div>
          {isDefined(data.description) && (
            <div className="mt-0.5 text-xs text-neutralSecondary">
              {data.description}
            </div>
          )}
        </div>
        {isDefined(data.keybinding) && (
          <div>
            {/* <Keybind className="p-1 text-xs">{data.keybinding}</Keybind> */}
          </div>
        )}
      </div>
    </div>
  );
};

const SlashCommandCombobox = () => (
  <Combobox
    id={COMBOBOX_KEY_SLASH_COMMAND}
    component={SlashCommandComboboxEffect}
    trigger={COMBOBOX_TRIGGER_SLASH_COMMAND}
    onRenderItem={SlashCommandComboboxItem}
    // onSelectItem={useSlashCommandOnSelectItem()}
    onSelectItem={() => {}}
  />
);

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
