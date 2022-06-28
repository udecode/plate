import React, { CSSProperties, useMemo, useRef } from 'react';
import {
  createPlateUI,
  createBasicElementsPlugin,
  getPluginType,
  withPlateEventProvider,
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
import { editableProps } from "./common/editableProps";
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from './typescript/plateTypes';
import { playgroundValue } from './playgroundValue';
import { ToolbarButtons } from './ToolbarButtons';

const plugins = createMyPlugins(
[
  
],
{
  components: createPlateUI(),
})

]


export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    
  />
);
