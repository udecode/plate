import React from 'react';
import { Link } from '@styled-icons/material';
import {
  getBasicElementPlugins,
  getHistoryPlugin,
  getLinkPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  HeadingToolbar,
  SlatePlugins,
  ToolbarLink,
} from '@udecode/slate-plugins';
import { initialValueLinks } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Link';

export default {
  title: id,
  component: getLinkPlugin,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getLinkPlugin(),
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
