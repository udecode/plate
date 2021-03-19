import React from 'react';
import {
  ELEMENT_IMAGE,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useMediaEmbedPlugin,
  useReactPlugin,
  useSelectOnBackspacePlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValueEmbeds } from '../config/initialValues';

const id = 'Elements/Media Embed';

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
    useMediaEmbedPlugin(),
    useSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueEmbeds}
    />
  );
};
