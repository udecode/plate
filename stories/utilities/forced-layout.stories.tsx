import React from 'react';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useNormalizeTypesPlugin,
  useReactPlugin,
  useTrailingBlockPlugin,
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

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useNormalizeTypesPlugin({
      rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
    }),
    useTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type }),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueForcedLayout}
    />
  );
};
