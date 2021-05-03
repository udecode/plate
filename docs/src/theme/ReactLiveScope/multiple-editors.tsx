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
import styled from 'styled-components';

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

export const MultipleEditor = ({
  id,
  initialValue,
  plugins,
}: {
  id?: string;
  initialValue?: TNode[];
  plugins?: SlatePlugin[];
}) => (
  <WrapperEditor>
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      // editableProps={editableProps}
      initialValue={initialValue}
    />
  </WrapperEditor>
);
