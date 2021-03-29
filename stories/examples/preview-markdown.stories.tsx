import React from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePreview } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { createPreviewPlugin } from './preview-markdown/createPreviewPlugin';

const id = 'Examples/Preview Markdown';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins: SlatePlugin[] = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createPreviewPlugin(),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValuePreview}
  />
);
