import React from 'react';
import {
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createHighlightPlugin,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueHighlight } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { ToolbarButtonsBasicMarks } from '../config/Toolbars';

const id = 'Marks/Highlight';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  ...createBasicMarkPlugins(),
  createHighlightPlugin(),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueHighlight}
  >
    <HeadingToolbar>
      <ToolbarButtonsBasicMarks />
    </HeadingToolbar>
  </SlatePlugins>
);
