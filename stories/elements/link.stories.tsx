import React from 'react';
import { Link } from '@styled-icons/material';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useLinkPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
  ToolbarLink,
} from '@udecode/slate-plugins-components';
import { editableProps, initialValueLinks } from '../config/initialValues';

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
