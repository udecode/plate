import 'tippy.js/dist/tippy.css';
import React, { useMemo } from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import {
  createAlignPlugin,
  createAutoformatPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createDeserializeHTMLPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createSoftBreakPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  ELEMENT_H1,
  ELEMENT_IMAGE,
  ELEMENT_MENTION,
  ELEMENT_PARAGRAPH,
  HeadingToolbar,
  MentionElement,
  MentionSelect,
  SlatePlugin,
  SlatePlugins,
  SPEditor,
  ToolbarImage,
  ToolbarLink,
  ToolbarSearchHighlight,
  useFindReplacePlugin,
  useMentionPlugin,
  withProps,
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
import { withStyledPlaceHolders } from '../config/withStyledPlaceHolders';
import { ReactEditor } from 'slate-react';

const id = 'Examples/Playground';

export default {
  title: id,
};

let defaultComponents = createSlatePluginsComponents({
  [ELEMENT_MENTION]: withProps(MentionElement, {
    renderLabel: renderMentionLabel,
  }),
});
defaultComponents = withStyledPlaceHolders(defaultComponents);

const defaultOptions = createSlatePluginsOptions();

export const Plugins = ({
  components = defaultComponents,
  options = defaultOptions,
}: any) => {
  const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const pluginsMemo = useMemo(() => {
    const plugins: SlatePlugin<ReactEditor & SPEditor>[] = [
      createReactPlugin(),
      createHistoryPlugin(),
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createTodoListPlugin(),
      createHeadingPlugin(),
      createImagePlugin(),
      createLinkPlugin(),
      createListPlugin(),
      createTablePlugin(),
      createMediaEmbedPlugin(),
      createCodeBlockPlugin(),
      createAlignPlugin(),
      createBoldPlugin(),
      createCodePlugin(),
      createItalicPlugin(),
      createHighlightPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      createKbdPlugin(),
      createNodeIdPlugin(),
      createAutoformatPlugin(optionsAutoformat),
      createResetNodePlugin(optionsResetBlockTypePlugin),
      createSoftBreakPlugin(optionsSoftBreakPlugin),
      createExitBreakPlugin(optionsExitBreakPlugin),
      createNormalizeTypesPlugin({
        rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
      }),
      createTrailingBlockPlugin({
        type: options[ELEMENT_PARAGRAPH].type,
        level: 1,
      }),
      createSelectOnBackspacePlugin({ allow: options[ELEMENT_IMAGE].type }),
      mentionPlugin,
      searchHighlightPlugin,
    ];

    plugins.push(createDeserializeHTMLPlugin({ plugins }));

    return plugins;
  }, [mentionPlugin, options, searchHighlightPlugin]);

  return (
    <SlatePlugins
      id={id}
      plugins={pluginsMemo}
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
