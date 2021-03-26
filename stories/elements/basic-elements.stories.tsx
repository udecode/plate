import 'prismjs/themes/prism.css';
import React from 'react';
import {
  getBlockquotePlugin,
  getCodeBlockPlugin,
  getExitBreakPlugin,
  getHeadingPlugin,
  getHistoryPlugin,
  getParagraphPlugin,
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
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Elements/Basic Elements';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  getParagraphPlugin(),
  getBlockquotePlugin(),
  getCodeBlockPlugin(),
  getHeadingPlugin(),
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
      <ToolbarButtonsBasicElements />
    </HeadingToolbar>
  </SlatePlugins>
);
