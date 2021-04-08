import 'prismjs/themes/prism.css';
import React from 'react';
import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePlaceholder } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';
import { withStyledPlaceHolders } from '../config/withStyledPlaceHolders';

const id = 'HOC/Placeholder';

export default {
  title: id,
};

let components = createSlatePluginsComponents();

components = withStyledPlaceHolders(components);

const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createCodeBlockPlugin(),
  createHeadingPlugin(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValuePlaceholder}
  >
    <HeadingToolbar>
      <ToolbarButtonsBasicElements />
    </HeadingToolbar>
  </SlatePlugins>
);
