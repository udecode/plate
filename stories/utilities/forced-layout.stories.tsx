import React from 'react';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  getBasicElementPlugins,
  getHistoryPlugin,
  getNormalizeTypesPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getTrailingBlockPlugin,
  SlatePlugins,
  withNormalizeTypes,
  withTrailingBlock,
} from '@udecode/slate-plugins';
import { initialValueForcedLayout } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Utilities/Forced Layout';

export default {
  title: id,
  component: withNormalizeTypes,
  subcomponents: { withTrailingNode: withTrailingBlock },
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getNormalizeTypesPlugin({
    rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
  }),
  getTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueForcedLayout}
  />
);
