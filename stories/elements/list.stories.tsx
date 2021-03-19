import React from 'react';
import { FormatListBulleted, FormatListNumbered } from '@styled-icons/material';
import {
  ELEMENT_OL,
  ELEMENT_UL,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useEditorPluginType,
  useExitBreakPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useListPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
  useTodoListPlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
  ToolbarList,
} from '@udecode/slate-plugins-components';
import { editableProps, initialValueList } from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';

const id = 'Elements/List';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const Toolbar = () => (
  <HeadingToolbar>
    <ToolbarList
      type={useEditorPluginType(ELEMENT_UL)}
      icon={<FormatListBulleted />}
    />
    <ToolbarList
      type={useEditorPluginType(ELEMENT_OL)}
      icon={<FormatListNumbered />}
    />
  </HeadingToolbar>
);

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
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
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
      <Toolbar />
    </SlatePlugins>
  );
};
