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
import {
  getSlatePluginsComponents,
  HeadingToolbar,
} from '@udecode/slate-plugins-components';
import { initialValueBasicMarks } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { ToolbarButtonsBasicMarks } from '../config/Toolbars';

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
      <HeadingToolbar>
        <ToolbarButtonsBasicMarks />
      </HeadingToolbar>
    </SlatePlugins>
  );
};
