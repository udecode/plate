import 'tippy.js/dist/tippy.css';
import React, { useMemo } from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import {
  ELEMENT_H1,
  ELEMENT_IMAGE,
  ELEMENT_MENTION,
  ELEMENT_PARAGRAPH,
  getAlignPlugin,
  getAutoformatPlugin,
  getBlockquotePlugin,
  getBoldPlugin,
  getCodeBlockPlugin,
  getCodePlugin,
  getComponent,
  getDeserializeHTMLPlugin,
  getExitBreakPlugin,
  getHeadingPlugin,
  getHighlightPlugin,
  getHistoryPlugin,
  getImagePlugin,
  getItalicPlugin,
  getLinkPlugin,
  getListPlugin,
  getMediaEmbedPlugin,
  getNodeIdPlugin,
  getNormalizeTypesPlugin,
  getParagraphPlugin,
  getReactPlugin,
  getResetNodePlugin,
  getSelectOnBackspacePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getSoftBreakPlugin,
  getStrikethroughPlugin,
  getSubscriptPlugin,
  getSuperscriptPlugin,
  getTablePlugin,
  getTodoListPlugin,
  getTrailingBlockPlugin,
  getUnderlinePlugin,
  HeadingToolbar,
  MentionElement,
  MentionSelect,
  SlatePlugin,
  SlatePlugins,
  ToolbarImage,
  ToolbarLink,
  ToolbarSearchHighlight,
  useFindReplacePlugin,
  useMentionPlugin,
} from '@udecode/slate-plugins';
import { optionsAutoformat } from '../config/autoformatRules';
import { initialValuePlayground } from '../config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsMentionPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../config/pluginOptions';
import { renderMentionLabel } from '../config/renderMentionLabel';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../config/Toolbars';

const id = 'Examples/Playground';

export default {
  title: id,
};

const defaultComponents = getSlatePluginsComponents({
  [ELEMENT_MENTION]: getComponent(MentionElement, {
    renderLabel: renderMentionLabel,
  }),
});
const defaultOptions = getSlatePluginsOptions();

export const Plugins = ({
  components = defaultComponents,
  options = defaultOptions,
}: any) => {
  const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin[] = useMemo(() => {
    const _plugins = [
      getReactPlugin(),
      getHistoryPlugin(),
      getParagraphPlugin(),
      getBlockquotePlugin(),
      getTodoListPlugin(),
      getHeadingPlugin(),
      getImagePlugin(),
      getLinkPlugin(),
      getListPlugin(),
      getTablePlugin(),
      getMediaEmbedPlugin(),
      getCodeBlockPlugin(),
      getAlignPlugin(),
      getBoldPlugin(),
      getCodePlugin(),
      getItalicPlugin(),
      getHighlightPlugin(),
      getUnderlinePlugin(),
      getStrikethroughPlugin(),
      getSubscriptPlugin(),
      getSuperscriptPlugin(),
      getNodeIdPlugin(),
      getAutoformatPlugin(optionsAutoformat),
      getResetNodePlugin(optionsResetBlockTypePlugin),
      getSoftBreakPlugin(optionsSoftBreakPlugin),
      getExitBreakPlugin(optionsExitBreakPlugin),
      getNormalizeTypesPlugin({
        rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
      }),
      getTrailingBlockPlugin({
        type: options[ELEMENT_PARAGRAPH].type,
        level: 1,
      }),
      getSelectOnBackspacePlugin({ allow: options[ELEMENT_IMAGE].type }),
      mentionPlugin,
      searchHighlightPlugin,
    ];

    _plugins.push(getDeserializeHTMLPlugin({ plugins: _plugins }));

    return _plugins;
  }, [mentionPlugin, options, searchHighlightPlugin]);

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePlayground}
    >
      <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
        <ToolbarButtonsList />
        <ToolbarButtonsBasicMarks />
        <ToolbarButtonsAlign />
        <ToolbarLink icon={<Link />} />
        <ToolbarImage icon={<Image />} />
        <ToolbarButtonsTable />
      </HeadingToolbar>

      <BallonToolbarMarks />

      <MentionSelect
        {...getMentionSelectProps()}
        renderLabel={renderMentionLabel}
      />
    </SlatePlugins>
  );
};
