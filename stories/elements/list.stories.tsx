import React from 'react';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useListPlugin,
  useReactPlugin,
  useResetNodePlugin,
  useSoftBreakPlugin,
  useTodoListPlugin,
} from '@udecode/slate-plugins';
import { HeadingToolbar } from '@udecode/slate-plugins-components';
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useImagePlugin(),
    useTodoListPlugin(),
    useListPlugin(),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
    useResetNodePlugin(optionsResetBlockTypePlugin),
  ];

  return (
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
};
