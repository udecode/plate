import React, { useMemo } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  getSlatePluginsOptions,
  HeadingPlugin,
  MentionNodeData,
  MentionPlugin,
  ParagraphPlugin,
  SlateDocument,
  SlatePlugins,
  useMention,
  useSlatePluginsActions,
  useSlatePluginsEditor,
  withInlineVoid,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  MentionSelect,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueMentions } from '../../stories-2/config/initialValues';
import { MENTIONABLES } from '../../stories-2/config/mentionables';
import { renderMentionLabel } from '../config/renderMentionLabel';

const id = 'Elements/Mention';

export default {
  title: id,
  component: MentionPlugin,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const { getMentionSelectProps, ...mentionPlugin } = MentionPlugin({
    mentionables: MENTIONABLES,
    maxSuggestions: 10,
    insertSpaceAfterMention: boolean('insert Space After Mention', false),
    trigger: '@',
    mentionableFilter: (s: string) => (mentionable: MentionNodeData) =>
      mentionable.email.toLowerCase().includes(s.toLowerCase()) ||
      mentionable.name.toLowerCase().includes(s.toLowerCase()),
    mentionableSearchPattern: boolean('useCustomMentionableSearchPattern', true)
      ? text('mentionableSearchPattern', '\\S*')
      : undefined,
  });

  const plugins = [ParagraphPlugin(), HeadingPlugin(), mentionPlugin];

  plugins.push({
    withOverrides: [withReact, withHistory, withInlineVoid({ plugins })],
  });

  // const {
  //   onAddMention,
  //   onChangeMention,
  //   onKeyDownMention,
  //   search,
  //   index,
  //   target,
  //   values,
  // } = useMention();

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      initialValue={initialValueMentions}
    >
      <EditablePlugins
        id={id}
        // onKeyDown={useMemo(() => [onKeyDownMention], [onKeyDownMention])}
        // onKeyDownDeps={[index, search, target]}
        editableProps={{
          placeholder: 'Enter some text...',
        }}
      />

      <MentionSelect
        {...getMentionSelectProps()}
        renderLabel={renderMentionLabel}
      />
    </SlatePlugins>
  );
};
