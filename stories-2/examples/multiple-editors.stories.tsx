import 'prismjs/themes/prism.css';
import React from 'react';
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ImagePlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugin,
  SlatePlugins,
  SoftBreakPlugin,
  withImageUpload,
  withInlineVoid,
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import { Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import styled from 'styled-components';
import {
  initialValueBasicElements,
  initialValueImages,
  options,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
} from '../config/initialValues';

export default {
  title: 'Examples/Multiple Editors',
};

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
        initialValue={initialValue}
        withOverrides={withOverrides}
      >
        <EditablePlugins
          plugins={plugins}
          editableProps={{
            placeholder: 'Enter some rich text…',
            spellCheck: true,
            autoFocus: true,
          }}
        />
      </SlatePlugins>
    </WrapperEditor>
  );
};

export const Example = () => {
  const mainPlugins: SlatePlugin[] = [
    ParagraphPlugin(),
    BlockquotePlugin(),
    CodeBlockPlugin(),
    HeadingPlugin(),
    ResetBlockTypePlugin(optionsResetBlockTypes),
    SoftBreakPlugin(optionsSoftBreak),
    ExitBreakPlugin(optionsExitBreak),
  ];

  const imagePlugins = [ParagraphPlugin(), HeadingPlugin(), ImagePlugin()];

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
        withOverrides={imagewithOverrides}
        initialValue={initialValueImages}
      />
      <Editor id="3" />
    </Wrapper>
  );
};
