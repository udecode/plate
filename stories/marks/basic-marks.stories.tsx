import React from 'react';
import {
  getBasicElementPlugins,
  getBoldPlugin,
  getCodePlugin,
  getHistoryPlugin,
  getItalicPlugin,
  getKbdPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getStrikethroughPlugin,
  getSubscriptPlugin,
  getSuperscriptPlugin,
  getUnderlinePlugin,
  HeadingToolbar,
  SlatePlugins,
} from '@udecode/slate-plugins';
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
    getReactPlugin(),
    getHistoryPlugin(),
    ...getBasicElementPlugins(),
    getBoldPlugin(),
    getItalicPlugin(),
    getUnderlinePlugin(),
    getStrikethroughPlugin(),
    getSubscriptPlugin(),
    getSuperscriptPlugin(),
    getCodePlugin(),
    getKbdPlugin(),
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
