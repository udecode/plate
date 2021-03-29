import React from 'react';
import { Link } from '@styled-icons/material';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createLinkPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  HeadingToolbar,
  SlatePlugins,
  ToolbarLink,
} from '@udecode/slate-plugins';
import { initialValueLinks } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Link';

export default {
  title: id,
  component: createLinkPlugin,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createLinkPlugin(),
];

export const Example = () => (
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
