import React from 'react';
import {
  ELEMENT_PARAGRAPH,
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
  getTrailingBlockPlugin,
  HeadingToolbar,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueSoftBreak } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Utilities/Soft Break';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins: SlatePlugin[] = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
  getListPlugin(),
  getResetNodePlugin(optionsResetBlockTypePlugin),
  getSoftBreakPlugin(optionsSoftBreakPlugin),
  getExitBreakPlugin(optionsExitBreakPlugin),
  getTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueSoftBreak}
  >
    <HeadingToolbar>
      <ToolbarButtonsBasicElements />
    </HeadingToolbar>
  </SlatePlugins>
);
