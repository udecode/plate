import React from 'react';
import {
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createListPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createTablePlugin,
  createTrailingBlockPlugin,
  ELEMENT_PARAGRAPH,
  HeadingToolbar,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueExitBreak } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Utilities/Exit Break';

export default {
  title: id,
  component: createExitBreakPlugin,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins: SlatePlugin[] = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  ...createBasicMarkPlugins(),
  createListPlugin(),
  createTablePlugin(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
  createTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueExitBreak}
  >
    <HeadingToolbar>
      <ToolbarButtonsBasicElements />
    </HeadingToolbar>
  </SlatePlugins>
);
