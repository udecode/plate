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
  getTablePlugin,
  getTrailingBlockPlugin,
  HeadingToolbar,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueExitBreak } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Utilities/Exit Break';

export default {
  title: id,
  component: getExitBreakPlugin,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins: SlatePlugin[] = [
    getReactPlugin(),
    getHistoryPlugin(),
    ...getBasicElementPlugins(),
    ...getBasicMarkPlugins(),
    getListPlugin(),
    getTablePlugin(),
    getResetNodePlugin(optionsResetBlockTypePlugin),
    getSoftBreakPlugin(optionsSoftBreakPlugin),
    getExitBreakPlugin(optionsExitBreakPlugin),
    getTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueExitBreak}
    >
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
      </HeadingToolbar>
    </SlatePlugins>
  );
};
