import React from 'react';
import { Link } from '@styled-icons/material';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useLinkPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import { HeadingToolbar, ToolbarLink } from '@udecode/slate-plugins-components';
import { initialValueLinks } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Link';

export default {
  title: id,
  component: useLinkPlugin,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useLinkPlugin(),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueLinks}
    >
      <HeadingToolbar>
        <ToolbarLink icon={<Link />} />
      </HeadingToolbar>
    </SlatePlugins>
  );
};
