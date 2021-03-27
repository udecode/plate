import React from 'react';
import {
  getAlignPlugin,
  getBasicElementPlugins,
  getExitBreakPlugin,
  getHistoryPlugin,
  getReactPlugin,
  getResetNodePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueBasicElements } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsAlign } from '../config/Toolbars';

const id = 'Elements/Alignment';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getAlignPlugin(),
  getResetNodePlugin(optionsResetBlockTypePlugin),
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
    initialValue={initialValueBasicElements}
  >
    <HeadingToolbar>
      <ToolbarButtonsAlign />
    </HeadingToolbar>
  </SlatePlugins>
);
