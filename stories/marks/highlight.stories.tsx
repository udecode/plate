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
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValueHighlight } from '../config/initialValues';
import { HeadingToolbarMarks } from '../config/Toolbars';

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
      <HeadingToolbarMarks />
    </SlatePlugins>
  );
};
