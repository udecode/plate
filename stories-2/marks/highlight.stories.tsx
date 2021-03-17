import React from 'react';
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
  SlatePlugins,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/slate-plugins';
import { HeadingToolbar, ToolbarMark } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueHighlight } from '../config/initialValues';

const id = 'Marks/Highlight';

export default {
  title: id,
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

const withOverrides = [withReact, withHistory] as const;

export const All = () => {
  const plugins: any[] = [ParagraphPlugin(), HeadingPlugin()];
  if (boolean('HighlightPlugin', true)) plugins.push(HighlightPlugin());

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueHighlight}
        withOverrides={withOverrides}
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
          editableProps={{
            placeholder: 'Enter some rich text...',
            spellCheck: true,
            autoFocus: true,
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
