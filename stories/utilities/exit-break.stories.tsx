import React from 'react';
import {
  ELEMENT_PARAGRAPH,
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useListPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
  useTablePlugin,
  useTrailingNodePlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { editableProps, initialValueExitBreak } from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { HeadingToolbarBasicElements } from '../config/Toolbars';

const id = 'Utilities/Exit Break';

export default {
  title: id,
  component: useExitBreakPlugin,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins: SlatePlugin[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useListPlugin(),
    useTablePlugin(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
    useTrailingNodePlugin({ type: options[ELEMENT_PARAGRAPH].type }),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueExitBreak}
    >
      <HeadingToolbarBasicElements />
    </SlatePlugins>
  );
};
