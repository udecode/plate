import React, { useMemo } from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_MENTION,
  getComponent,
  MentionElement,
  MentionSelect,
  SlatePlugin,
  SlatePlugins,
  useMentionPlugin,
} from '@udecode/slate-plugins';
import { initialValueMentions } from '../config/initialValues';
import { editableProps, optionsMentionPlugin } from '../config/pluginOptions';
import { renderMentionLabel } from '../config/renderMentionLabel';

const id = 'Elements/Mention';

export default {
  title: id,
};

const components = createSlatePluginsComponents({
  [ELEMENT_MENTION]: getComponent(MentionElement, {
    renderLabel: renderMentionLabel,
  }),
});
const options = createSlatePluginsOptions();

export const Example = () => {
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin[] = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      ...createBasicElementPlugins(),
      mentionPlugin,
    ],
    [mentionPlugin]
  );

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
