import React from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createImagePlugin,
  createReactPlugin,
  createSelectOnBackspacePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_IMAGE,
  SlatePlugin,
  SlatePlugins,
  TNode,
} from '@udecode/slate-plugins';
import { HeadingToolbar } from '@udecode/slate-plugins-toolbar';
import styled from 'styled-components';
import { createExitBreakPlugin } from '../../../../packages/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../../packages/break/src/soft-break/createSoftBreakPlugin';
import { createResetNodePlugin } from '../../../../packages/reset-node/src/createResetNodePlugin';
import { initialValueBasicElements } from '../../../../stories/config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../../../stories/config/pluginOptions';
import { ToolbarButtonsBasicElements } from '../../../../stories/config/Toolbars';

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();

export const mainPlugins: SlatePlugin[] = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
];

export const imagePlugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createImagePlugin(),
  createSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

export const corePlugins = [createReactPlugin(), createHistoryPlugin()];

const Wrapper = styled.div`
  display: flex;
`;

const WrapperEditor = styled.div`
  flex: 1;
  border: 1px solid #e1e4e8;
  border-radius: 6px;

  margin: 8px;
  padding: 16px;
`;

export const BasicElements = () => {
  const plugins = [
    // ...pluginsCore,
    ...createBasicElementPlugins(),
    createResetNodePlugin(optionsResetBlockTypePlugin),
    createSoftBreakPlugin(optionsSoftBreakPlugin),
    createExitBreakPlugin(optionsExitBreakPlugin),
  ];

  return (
    <>
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
      </HeadingToolbar>
      <SlatePlugins
        id="basic-elements"
        plugins={plugins}
        components={components}
        options={options}
        editableProps={editableProps}
        initialValue={initialValueBasicElements}
      />
    </>
  );
};
