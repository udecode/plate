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
  headingTypes,
  initialValueBasicElements,
  initialValueImages,
  options,
  optionsResetBlockTypes,
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
  withPlugins,
  initialValue,
  plugins,
}: {
  id?: string;
  initialValue?: Node[];
  plugins?: SlatePlugin[];
  withPlugins?: any;
}) => {
  return (
    <WrapperEditor>
      <SlatePlugins
        id={id}
        initialValue={initialValue}
        withPlugins={withPlugins}
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
    ParagraphPlugin(options),
    BlockquotePlugin(options),
    CodeBlockPlugin(options),
    HeadingPlugin(options),
    ResetBlockTypePlugin(optionsResetBlockTypes),
    SoftBreakPlugin({
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [options.code_block.type, options.blockquote.type],
          },
        },
      ],
    }),
    ExitBreakPlugin({
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: headingTypes,
          },
        },
      ],
    }),
  ];

  const imagePlugins = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    ImagePlugin(options),
  ];

  const imageWithPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withInlineVoid({ plugins: imagePlugins }),
    withSelectOnBackspace({ allow: [options.img.type] }),
  ] as const;

  return (
    <Wrapper>
      <Editor plugins={mainPlugins} initialValue={initialValueBasicElements} />
      <Editor
        id="image"
        plugins={imagePlugins}
        withPlugins={imageWithPlugins}
        initialValue={initialValueImages}
      />
      <Editor id="3" />
    </Wrapper>
  );
};
