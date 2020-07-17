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
import {
  BoldPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  HighlightPlugin,
  ItalicPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  ToolbarMark,
  UnderlinePlugin,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueHighlight, options } from '../config/initialValues';

export default {
  title: 'Marks/Highlight',
  subcomponents: {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    CodePlugin,
    ToolbarMark,
  },
};

const withPlugins = [withReact, withHistory] as const;

export const All = () => {
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];
  if (boolean('HighlightPlugin', true)) plugins.push(HighlightPlugin(options));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueHighlight);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
