import React, { useMemo } from 'react';
import { ReactEditor } from 'slate-react';
import {
  SlatePlugin,
  SPEditor
} from '@udecode/slate-plugins-core';
import {
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createDeserializeHTMLPlugin,
  createHighlightPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  SlatePlugins,
  useMentionPlugin,
} from '@udecode/slate-plugins';
import { initialValuePasteHtml } from '../config/initialValues';
import { editableProps, optionsSoftBreakPlugin } from '../config/pluginOptions';

const id = 'Deserializers/HTML';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();

export const Example = () => {
  const { plugin: mentionPlugin } = useMentionPlugin();

  const pluginsMemo = useMemo(() => {
    const plugins: SlatePlugin<ReactEditor & SPEditor>[] = [
      createReactPlugin(),
      createHistoryPlugin(),
      ...createBasicElementPlugins(),
      ...createBasicMarkPlugins(),
      createImagePlugin(),
      createLinkPlugin(),
      createListPlugin(),
      createTablePlugin(),
      createTodoListPlugin(),
      createMediaEmbedPlugin(),
      createHighlightPlugin(),
      createSoftBreakPlugin(optionsSoftBreakPlugin),
      mentionPlugin,
    ];

    plugins.push(createDeserializeHTMLPlugin({ plugins }));

    return plugins;
  }, [mentionPlugin]);

  return (
    <SlatePlugins
      id={id}
      plugins={pluginsMemo}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePasteHtml}
    />
  );
};
