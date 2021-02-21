import React, { useMemo, useState } from "react";
import { text, boolean } from "@storybook/addon-knobs";
import {
  EditablePlugins,
  HeadingPlugin,
  MentionNodeData,
  MentionPlugin,
  MentionSelect,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  useMention,
  withInlineVoid,
} from "@udecode/slate-plugins";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, withReact } from "slate-react";
import { initialValueMentions, options } from "../config/initialValues";
import { MENTIONABLES } from "../config/mentionables";

export default {
  title: "Elements/Mention",
  component: MentionPlugin,
  subcomponents: {
    useMention,
    MentionSelect,
  },
};

const renderLabel = (mentionable: MentionNodeData) => {
  const entry = MENTIONABLES.find((m) => m.value === mentionable.value);
  if (!entry) return "unknown option";
  return `${entry.name} - ${entry.email}`;
};

export const Example = () => {
  const plugins = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    MentionPlugin({
      mention: {
        ...options.mention,
        rootProps: {
          onClick: (mentionable: MentionNodeData) =>
            console.info(`Hello, I'm ${mentionable.value}`),
          prefix: text("prefix", "@"),
          renderLabel,
        },
      },
    }),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

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
      insertSpaceAfterMention: boolean("insert Space After Mention", false),
      trigger: "@",
      mentionableFilter: (search: string) => (mentionable: MentionNodeData) =>
        mentionable.email.toLowerCase().includes(search.toLowerCase()) ||
        mentionable.name.toLowerCase().includes(search.toLowerCase()),
      mentionableSearchPattern: boolean(
        "useCustomMentionableSearchPattern",
        true
      )
        ? text("mentionableSearchPattern", "\\S*")
        : undefined,
    });

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);

          onChangeMention(editor);
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some text..."
          onKeyDown={[onKeyDownMention]}
          onKeyDownDeps={[index, search, target]}
        />

        <MentionSelect
          at={target}
          valueIndex={index}
          options={values}
          onClickMention={onAddMention}
          renderLabel={renderLabel}
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
