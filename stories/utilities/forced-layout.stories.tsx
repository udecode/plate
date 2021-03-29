import React from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createNormalizeTypesPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createTrailingBlockPlugin,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
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

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createNormalizeTypesPlugin({
    rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
  }),
  createTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
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
