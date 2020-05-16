import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  HeadingToolbar,
  HighlightPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  ParagraphPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  ToolbarMark,
  UnderlinePlugin,
} from '../../packages/slate-plugins/src';
import { initialValueMarks, nodeTypes } from '../config/initialValues';

export default {
  title: 'Text/Marks',
  subcomponents: {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    InlineCodePlugin,
    MarkButton: ToolbarMark,
  },
};

export const All = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(nodeTypes));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(nodeTypes));
  if (boolean('UnderlinePlugin', true))
    plugins.push(UnderlinePlugin(nodeTypes));
  if (boolean('StrikethroughPlugin', true))
    plugins.push(StrikethroughPlugin(nodeTypes));
  if (boolean('SubscriptPlugin', true))
    plugins.push(SubscriptPlugin(nodeTypes));
  if (boolean('SuperscriptPlugin', true))
    plugins.push(SuperscriptPlugin(nodeTypes));
  if (boolean('InlineCodePlugin', true))
    plugins.push(InlineCodePlugin(nodeTypes));
  if (boolean('HighlightPlugin', true))
    plugins.push(HighlightPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarks);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <ToolbarMark
            type={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <ToolbarMark type={MARK_CODE} icon={<CodeAlt />} />
          <ToolbarMark
            type={MARK_SUPERSCRIPT}
            clear={MARK_SUBSCRIPT}
            icon={<Superscript />}
          />
          <ToolbarMark
            type={MARK_SUBSCRIPT}
            clear={MARK_SUPERSCRIPT}
            icon={<Subscript />}
          />
        </HeadingToolbar>
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
