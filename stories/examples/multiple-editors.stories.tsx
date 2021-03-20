import 'prismjs/themes/prism.css';
import React from 'react';
import {
  ELEMENT_IMAGE,
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  useBasicElementPlugins,
  useExitBreakPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSelectOnBackspacePlugin,
  useSoftBreakPlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
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
}) => {
  return (
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
};

export const Example = () => {
  const mainPlugins: SlatePlugin[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
  ];

  const imagePlugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useImagePlugin(),
    useSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
  ];

  const corePlugins = [useReactPlugin(), useHistoryPlugin()];

  return (
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
};
