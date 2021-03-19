import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useAutoformatPlugin,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useListPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
  withAutoformat,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { autoformatRules } from '../config/autoformatRules';
import { editableProps, initialValueAutoformat } from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';

const id = 'Utilities/Autoformat';

export default {
  title: id,
  component: withAutoformat,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useListPlugin(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
    useAutoformatPlugin({
      rules: autoformatRules,
    }),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueAutoformat}
    />
  );
};
