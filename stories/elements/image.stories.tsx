import React from 'react';
import { Image } from '@styled-icons/material';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createImagePlugin,
  createReactPlugin,
  createSelectOnBackspacePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_IMAGE,
  HeadingToolbar,
  SlatePlugins,
  ToolbarImage,
} from '@udecode/slate-plugins';
import { initialValueImages } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Image';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createImagePlugin(),
  createSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueImages}
  >
    <HeadingToolbar>
      <ToolbarImage icon={<Image />} />
    </HeadingToolbar>
  </SlatePlugins>
);
