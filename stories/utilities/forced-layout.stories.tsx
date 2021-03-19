import React from 'react';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useNormalizeTypesPlugin,
  useReactPlugin,
  useTrailingNodePlugin,
  withNormalizeTypes,
  withTrailingNode,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import {
  editableProps,
  initialValueForcedLayout,
} from '../config/initialValues';

const id = 'Utilities/Forced Layout';

export default {
  title: id,
  component: withNormalizeTypes,
  subcomponents: { withTrailingNode },
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
    useTrailingNodePlugin({ type: options[ELEMENT_PARAGRAPH].type }),
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
