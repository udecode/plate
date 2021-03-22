import React from 'react';
import { Image } from '@styled-icons/material';
import {
  ELEMENT_IMAGE,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  HeadingToolbar,
  SlatePlugins,
  ToolbarImage,
  useBasicElementPlugins,
  useHistoryPlugin,
  useImagePlugin,
  useReactPlugin,
  useSelectOnBackspacePlugin,
} from '@udecode/slate-plugins';
import { initialValueImages } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Image';

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
    useImagePlugin(),
    useSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
  ];

  return (
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
};
