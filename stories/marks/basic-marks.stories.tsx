import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Keyboard,
} from '@styled-icons/material';
import {
  BoldPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  ItalicPlugin,
  KbdPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_KBD,
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
import { initialValueBasicMarks, options } from '../config/initialValues';

const id = 'Marks/Basic Marks';

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
    KbdPlugin,
  },
};

const withPlugins = [withReact, withHistory] as const;

export const All = () => {
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(options));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(options));
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin(options));
  if (boolean('StrikethroughPlugin', true))
    plugins.push(StrikethroughPlugin(options));
  if (boolean('SubscriptPlugin', true)) plugins.push(SubscriptPlugin(options));
  if (boolean('SuperscriptPlugin', true))
    plugins.push(SuperscriptPlugin(options));
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin(options));
  if (boolean('KbdPlugin', true)) plugins.push(KbdPlugin(options));

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueBasicMarks}
        withPlugins={withPlugins}
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
          <ToolbarMark type={MARK_KBD} icon={<Keyboard />} />
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
