import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useHighlightPlugin,
  useHistoryPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
} from '@udecode/slate-plugins-components';
import { initialValueHighlight } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { ToolbarButtonsBasicMarks } from '../config/Toolbars';

const id = 'Marks/Highlight';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useHighlightPlugin(),
  ];

  return (
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
};
