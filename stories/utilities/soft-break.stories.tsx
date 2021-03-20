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
  useTrailingNodePlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
} from '@udecode/slate-plugins-components';
import { initialValueSoftBreak } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../config/Toolbars';

const id = 'Utilities/Soft Break';

export default {
  title: id,
  component: useSoftBreakPlugin,
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
      initialValue={initialValueSoftBreak}
    >
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
      </HeadingToolbar>
    </SlatePlugins>
  );
};
