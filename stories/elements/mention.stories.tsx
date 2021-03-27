import React, { useMemo } from 'react';
import {
  ELEMENT_MENTION,
  getBasicElementPlugins,
  getComponent,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
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

const components = getSlatePluginsComponents({
  [ELEMENT_MENTION]: getComponent(MentionElement, {
    renderLabel: renderMentionLabel,
  }),
});
const options = getSlatePluginsOptions();

export const Example = () => {
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin[] = useMemo(
    () => [
      getReactPlugin(),
      getHistoryPlugin(),
      ...getBasicElementPlugins(),
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
