import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useBoldPlugin,
  useCodePlugin,
  useHistoryPlugin,
  useItalicPlugin,
  useKbdPlugin,
  useReactPlugin,
  useStrikethroughPlugin,
  useSubscriptPlugin,
  useSuperscriptPlugin,
  useUnderlinePlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValueBasicMarks } from '../config/initialValues';
import { HeadingToolbarMarks } from '../config/Toolbars';

const id = 'Marks/Basic Marks';

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
    useBoldPlugin(),
    useItalicPlugin(),
    useUnderlinePlugin(),
    useStrikethroughPlugin(),
    useSubscriptPlugin(),
    useSuperscriptPlugin(),
    useCodePlugin(),
    useKbdPlugin(),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueBasicMarks}
    >
      <HeadingToolbarMarks />
    </SlatePlugins>
  );
};
