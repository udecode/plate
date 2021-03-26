import React from 'react';
import {
  getAutoformatPlugin,
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getExitBreakPlugin,
  getHistoryPlugin,
  getListPlugin,
  getReactPlugin,
  getResetNodePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
  getListPlugin(),
  getResetNodePlugin(optionsResetBlockTypePlugin),
  getSoftBreakPlugin(optionsSoftBreakPlugin),
  getExitBreakPlugin(optionsExitBreakPlugin),
  getAutoformatPlugin(optionsAutoformat),
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
