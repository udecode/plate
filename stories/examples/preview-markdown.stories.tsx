import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValuePreview } from '../config/initialValues';
import { usePreviewPlugin } from './preview-markdown/usePreviewPlugin';

const id = 'Examples/Preview Markdown';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins: any[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    usePreviewPlugin(),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePreview}
    />
  );
};
