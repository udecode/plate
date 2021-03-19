import React from 'react';
import {
  ELEMENT_MENTION,
  getSlatePluginsOptions,
  MentionNodeData,
  SlatePlugin,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useMentionPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import {
  getComponent,
  getSlatePluginsComponents,
  MentionElement,
  MentionSelect,
} from '@udecode/slate-plugins-components';
import { editableProps, initialValueMentions } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';
import { optionsMentionPlugin } from '../config/pluginOptions';
import { renderMentionLabel } from '../config/renderMentionLabel';

const id = 'Elements/Mention';

export default {
  title: id,
};

const components = {
  ...getSlatePluginsComponents(),
  [ELEMENT_MENTION]: getComponent(MentionElement, {
    renderLabel: (mentionable: MentionNodeData) => {
      const entry = MENTIONABLES.find((m) => m.value === mentionable.value);
      if (!entry) return 'unknown option';
      return `${entry.name} - ${entry.email}`;
    },
  }),
};
const options = getSlatePluginsOptions();

export const Example = () => {
  const { getMentionSelectProps, ...mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    mentionPlugin,
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueMentions}
    >
      <MentionSelect
        {...getMentionSelectProps()}
        renderLabel={renderMentionLabel}
      />
    </SlatePlugins>
  );
};
