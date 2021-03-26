import React, { useMemo } from 'react';
import {
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getDeserializeHTMLPlugin,
  getHighlightPlugin,
  getHistoryPlugin,
  getImagePlugin,
  getLinkPlugin,
  getListPlugin,
  getMediaEmbedPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
  getTablePlugin,
  getTodoListPlugin,
  SlatePlugins,
  useMentionPlugin,
} from '@udecode/slate-plugins';
import { initialValuePasteHtml } from '../config/initialValues';
import { editableProps, optionsSoftBreakPlugin } from '../config/pluginOptions';

const id = 'Deserializers/HTML';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const { plugin: mentionPlugin } = useMentionPlugin();

  const pluginsMemo = useMemo(() => {
    const plugins = [
      getReactPlugin(),
      getHistoryPlugin(),
      ...getBasicElementPlugins(),
      ...getBasicMarkPlugins(),
      getImagePlugin(),
      getLinkPlugin(),
      getListPlugin(),
      getTablePlugin(),
      getTodoListPlugin(),
      getMediaEmbedPlugin(),
      getHighlightPlugin(),
      getSoftBreakPlugin(optionsSoftBreakPlugin),
      mentionPlugin,
    ];

    plugins.push(getDeserializeHTMLPlugin({ plugins }));

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
