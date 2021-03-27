import React from 'react';
import {
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getHighlightPlugin,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
  getHighlightPlugin(),
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
