import React from 'react';
import {
  getBasicElementPlugins,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePreview } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { getPreviewPlugin } from './preview-markdown/getPreviewPlugin';

const id = 'Examples/Preview Markdown';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins: SlatePlugin[] = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getPreviewPlugin(),
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
