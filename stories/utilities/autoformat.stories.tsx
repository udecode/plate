import React from 'react';
import {
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createListPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  SlatePlugins,
  withAutoformat,
} from '@udecode/slate-plugins';
import { optionsAutoformat } from '../config/autoformatRules';
import { initialValueAutoformat } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';

const id = 'Utilities/Autoformat';

export default {
  title: id,
  component: withAutoformat,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  ...createBasicMarkPlugins(),
  createListPlugin(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
  createAutoformatPlugin(optionsAutoformat),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueAutoformat}
  />
);
