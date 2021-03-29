import React from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createMediaEmbedPlugin,
  createReactPlugin,
  createSelectOnBackspacePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_IMAGE,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueEmbeds } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Media Embed';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createMediaEmbedPlugin(),
  createSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueEmbeds}
  />
);
