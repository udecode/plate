import 'prismjs/themes/prism.css';
import React from 'react';
import {
  EditablePlugins,
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  useBlockquotePlugin,
  useCodeBlockPlugin,
  useExitBreakPlugin,
  useHeadingPlugin,
  useImagePlugin,
  useParagraphPlugin,
  useResetBlockTypePlugin,
  useSoftBreakPlugin,
  withImageUpload,
  withInlineVoid,
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import styled from 'styled-components';
import { editableProps } from '../../stories/config/initialValues';
import {
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../stories/config/pluginOptions';
import {
  initialValueBasicElements,
  initialValueImages,
  options,
} from '../config/initialValues';

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
  withOverrides,
  initialValue,
  plugins,
}: {
  id?: string;
  initialValue?: Node[];
  plugins?: SlatePlugin[];
  withOverrides?: any;
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
    useParagraphPlugin(),
    useBlockquotePlugin(),
    useCodeBlockPlugin(),
    useHeadingPlugin(),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
  ];

  const imagePlugins = [
    useParagraphPlugin(),
    useHeadingPlugin(),
    useImagePlugin(),
  ];

  const imagewithOverrides = [
    withReact,
    withHistory,
    withImageUpload({}, options),
    withInlineVoid({ plugins: imagePlugins }),
    withSelectOnBackspace({ allow: [options.img.type] }),
  ] as const;

  return (
    <Wrapper>
      <Editor plugins={mainPlugins} initialValue={initialValueBasicElements} />
      <Editor
        id="image"
        plugins={imagePlugins}
        initialValue={initialValueImages}
      />
      <Editor id="3" />
    </Wrapper>
  );
};
