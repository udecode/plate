import 'prismjs/themes/prism.css';
import React, { useMemo } from 'react';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import {
  FormatQuote,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  getSlatePluginsOptions,
  HeadingPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugin,
  SlatePlugins,
  SlatePluginsOptions,
  SoftBreakPlugin,
  withCodeBlock,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
  ToolbarCodeBlock,
  ToolbarElement,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  initialValueBasicElements,
  options,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
} from '../config/initialValues';

const id = 'Elements/Basic Elements';

export default {
  title: id,
  subcomponents: {
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withCodeBlock({}, options),
] as const;

const SlateContent = () => {
  const plugins: SlatePlugin[] = [
    ParagraphPlugin(),
    BlockquotePlugin(),
    CodeBlockPlugin(),
    HeadingPlugin(),
    ResetBlockTypePlugin(optionsResetBlockTypes),
    SoftBreakPlugin(optionsSoftBreak),
    ExitBreakPlugin(optionsExitBreak),
  ];

  const components = useMemo(() => getSlatePluginsComponents(), []);

  return (
    <>
      <HeadingToolbar>
        <ToolbarElement type={options.h1.type} icon={<LooksOne />} />
        <ToolbarElement type={options.h2.type} icon={<LooksTwo />} />
        <ToolbarElement type={options.h3.type} icon={<Looks3 />} />
        <ToolbarElement type={options.h4.type} icon={<Looks4 />} />
        <ToolbarElement type={options.h5.type} icon={<Looks5 />} />
        <ToolbarElement type={options.h6.type} icon={<Looks6 />} />
        <ToolbarElement type={options.blockquote.type} icon={<FormatQuote />} />
        <ToolbarCodeBlock
          type={options.code_block.type}
          icon={<CodeBlock />}
          // options={options}
        />
      </HeadingToolbar>
      <EditablePlugins
        plugins={plugins}
        components={components}
        editableProps={{
          placeholder: 'Enter some rich text…',
          spellCheck: true,
          autoFocus: true,
        }}
      />
    </>
  );
};

export const Example = () => {
  const slatePluginsOptions: SlatePluginsOptions = useMemo(
    getSlatePluginsOptions,
    []
  );

  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueBasicElements}
      withPlugins={withPlugins}
      options={slatePluginsOptions}
    >
      <SlateContent />
    </SlatePlugins>
  );
};
