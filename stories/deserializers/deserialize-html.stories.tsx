import React from 'react';
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
  useMentionPlugin().plugin,
  getMediaEmbedPlugin(),
  getHighlightPlugin(),
  getSoftBreakPlugin(optionsSoftBreakPlugin),
];

plugins.push(getDeserializeHTMLPlugin({ plugins }));

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValuePasteHtml}
  />
);
