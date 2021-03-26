import React from 'react';
import {
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getExitBreakPlugin,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
  getTablePlugin,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
  getTablePlugin(),
  getSoftBreakPlugin(optionsSoftBreakPlugin),
  getExitBreakPlugin(optionsExitBreakPlugin),
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
