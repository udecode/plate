import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useBoldPlugin,
  useExitBreakPlugin,
  useHeadingPlugin,
  useHistoryPlugin,
  useParagraphPlugin,
  useReactPlugin,
  useSoftBreakPlugin,
  useTablePlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValueTables } from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { HeadingToolbarTable } from '../config/Toolbars';

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
      <HeadingToolbarTable />
    </SlatePlugins>
  );
};
