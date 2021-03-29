import React from 'react';
import {
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createTablePlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueTables } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsTable } from '../config/Toolbars';

const id = 'Elements/Table';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  ...createBasicMarkPlugins(),
  createTablePlugin(),
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
    initialValue={initialValueTables}
  >
    <HeadingToolbar>
      <ToolbarButtonsTable />
    </HeadingToolbar>
  </SlatePlugins>
);
