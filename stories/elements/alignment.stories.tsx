import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useAlignPlugin,
  useBasicElementPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import {
  editableProps,
  initialValueBasicElements,
} from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { HeadingToolbarAlign } from '../config/Toolbars';

const id = 'Elements/Alignment';

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
    useAlignPlugin(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
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
      initialValue={initialValueBasicElements}
    >
      <HeadingToolbarAlign />
    </SlatePlugins>
  );
};
