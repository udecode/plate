import React from 'react';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useReactPlugin,
  useSoftBreakPlugin,
  useTablePlugin,
} from '@udecode/slate-plugins';
import { HeadingToolbar } from '@udecode/slate-plugins-components';
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

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useTablePlugin(),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
  ];

  return (
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
};
