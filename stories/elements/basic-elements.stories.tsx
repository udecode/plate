import 'prismjs/themes/prism.css';
import React from 'react';
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
  SoftBreakPlugin,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  initialValueBasicElements,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
} from '../config/initialValues';
import { ToolbarBasicElements } from '../config/Toolbars';

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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins: SlatePlugin[] = [
    { withOverrides: [withReact, withHistory] },
    ParagraphPlugin(),
    BlockquotePlugin(),
    CodeBlockPlugin(),
    HeadingPlugin(),
    ResetBlockTypePlugin(optionsResetBlockTypes),
    SoftBreakPlugin(optionsSoftBreak),
    ExitBreakPlugin(optionsExitBreak),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      initialValue={initialValueBasicElements}
    >
      <ToolbarBasicElements />
      <EditablePlugins
        id={id}
        editableProps={{
          placeholder: 'Enter some rich text…',
          spellCheck: true,
          autoFocus: true,
        }}
      />
    </SlatePlugins>
  );
};
