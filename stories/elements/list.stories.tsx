import React from 'react';
import {
  createBasicElementPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createListPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createTodoListPlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueList } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsList } from '../config/Toolbars';

const id = 'Elements/List';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createImagePlugin(),
  createTodoListPlugin(),
  createListPlugin(),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
  createResetNodePlugin(optionsResetBlockTypePlugin),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueList}
  >
    <HeadingToolbar>
      <ToolbarButtonsList />
    </HeadingToolbar>
  </SlatePlugins>
);
