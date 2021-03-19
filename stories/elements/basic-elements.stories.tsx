import 'prismjs/themes/prism.css';
import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBlockquotePlugin,
  useCodeBlockPlugin,
  useExitBreakPlugin,
  useHeadingPlugin,
  useHistoryPlugin,
  useParagraphPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import {
  editableProps,
  initialValueBasicElements,
} from '../config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { HeadingToolbarBasicElements } from '../config/Toolbars';

const id = 'Elements/Basic Elements';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    useParagraphPlugin(),
    useBlockquotePlugin(),
    useCodeBlockPlugin(),
    useHeadingPlugin(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueBasicElements}
    >
      <HeadingToolbarBasicElements />
    </SlatePlugins>
  );
};
