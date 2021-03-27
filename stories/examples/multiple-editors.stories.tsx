import 'prismjs/themes/prism.css';
import React from 'react';
import {
  ELEMENT_IMAGE,
  getBasicElementPlugins,
  getExitBreakPlugin,
  getHistoryPlugin,
  getImagePlugin,
  getReactPlugin,
  getResetNodePlugin,
  getSelectOnBackspacePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { Node } from 'slate';
import styled from 'styled-components';
import {
  initialValueBasicElements,
  initialValueImages,
  initialValuePlainText,
} from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';

export default {
  title: 'Examples/Multiple Editors',
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const mainPlugins: SlatePlugin[] = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getResetNodePlugin(optionsResetBlockTypePlugin),
  getSoftBreakPlugin(optionsSoftBreakPlugin),
  getExitBreakPlugin(optionsExitBreakPlugin),
];

const imagePlugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getImagePlugin(),
  getSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

const corePlugins = [getReactPlugin(), getHistoryPlugin()];

const Wrapper = styled.div`
  display: flex;
`;

const WrapperEditor = styled.div`
  flex: 1;
  border: 1px solid #e1e4e8;
  border-radius: 6px;

  margin: 8px;
  padding: 16px;
  //width: 50%;
`;

const Editor = ({
  id,
  initialValue,
  plugins,
}: {
  id?: string;
  initialValue?: Node[];
  plugins?: SlatePlugin[];
}) => (
  <WrapperEditor>
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValue}
    />
  </WrapperEditor>
);

export const Example = () => (
  <Wrapper>
    <Editor plugins={mainPlugins} initialValue={initialValueBasicElements} />
    <Editor
      id="image"
      plugins={imagePlugins}
      initialValue={initialValueImages}
    />
    <Editor
      id="core"
      plugins={corePlugins}
      initialValue={initialValuePlainText}
    />
  </Wrapper>
);
