import React from 'react';
import { Image } from '@styled-icons/material';
import {
  ELEMENT_IMAGE,
  getBasicElementPlugins,
  getHistoryPlugin,
  getImagePlugin,
  getReactPlugin,
  getSelectOnBackspacePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getImagePlugin(),
  getSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
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
