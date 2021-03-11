import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
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
import { MentionSelect } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueMentions } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';

const id = 'Elements/Mention';

export default {
  title: id,
  component: MentionPlugin,
  subcomponents: {
    useMention,
    MentionSelect,
  },
};

const renderLabel = (mentionable: MentionNodeData) => {
  const entry = MENTIONABLES.find((m) => m.value === mentionable.value);
  if (!entry) return 'unknown option';
  return `${entry.name} - ${entry.email}`;
};

export const Example = () => {
  const plugins = [ParagraphPlugin(), HeadingPlugin(), MentionPlugin()];

  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    const {
      onAddMention,
      onChangeMention,
      onKeyDownMention,
      search,
      index,
      target,
      values,
    } = useMention(MENTIONABLES, {
      maxSuggestions: 10,
      insertSpaceAfterMention: boolean('insert Space After Mention', false),
      trigger: '@',
      mentionableFilter: (s: string) => (mentionable: MentionNodeData) =>
        mentionable.email.toLowerCase().includes(s.toLowerCase()) ||
        mentionable.name.toLowerCase().includes(s.toLowerCase()),
      mentionableSearchPattern: boolean(
        'useCustomMentionableSearchPattern',
        true
      )
        ? text('mentionableSearchPattern', '\\S*')
        : undefined,
    });

    const { setValue } = useSlatePluginsActions(id);
    const editor = useSlatePluginsEditor(id);

    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueMentions}
        withPlugins={withPlugins}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);

          onChangeMention(editor);
        }}
      >
        <EditablePlugins
          plugins={plugins}
          onKeyDown={[onKeyDownMention]}
          onKeyDownDeps={[index, search, target]}
          editableProps={{
            placeholder: 'Enter some text...',
          }}
        />

        <MentionSelect
          at={target}
          valueIndex={index}
          options={values}
          onClickMention={onAddMention}
          renderLabel={renderLabel}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
