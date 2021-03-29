import React from 'react';
import {
  createAlignPlugin,
  createBasicElementPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueBasicElements } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsAlign } from '../config/Toolbars';

const id = 'Elements/Alignment';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createAlignPlugin(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueBasicElements}
  >
    <HeadingToolbar>
      <ToolbarButtonsAlign />
    </HeadingToolbar>
  </SlatePlugins>
);
