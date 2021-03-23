import 'tippy.js/dist/tippy.css';
import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import {
  ELEMENT_H1,
  ELEMENT_IMAGE,
  ELEMENT_MENTION,
  ELEMENT_PARAGRAPH,
  getComponent,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  HeadingToolbar,
  MentionElement,
  MentionSelect,
  SlatePlugin,
  SlatePlugins,
  ToolbarImage,
  ToolbarLink,
  ToolbarSearchHighlight,
  useAlignPlugin,
  useAutoformatPlugin,
  useBlockquotePlugin,
  useBoldPlugin,
  useCodeBlockPlugin,
  useCodePlugin,
  useDeserializeHTMLPlugin,
  useExitBreakPlugin,
  useFindReplacePlugin,
  useHeadingPlugin,
  useHighlightPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useItalicPlugin,
  useLinkPlugin,
  useListPlugin,
  useMediaEmbedPlugin,
  useMentionPlugin,
  useNodeIdPlugin,
  useNormalizeTypesPlugin,
  useParagraphPlugin,
  useReactPlugin,
  useResetNodePlugin,
  useSelectOnBackspacePlugin,
  useSoftBreakPlugin,
  useStrikethroughPlugin,
  useSubscriptPlugin,
  useSuperscriptPlugin,
  useTablePlugin,
  useTodoListPlugin,
  useTrailingBlockPlugin,
  useUnderlinePlugin,
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
  const { setSearch, ...searchHighlightPlugin } = useFindReplacePlugin();
  const { getMentionSelectProps, ...mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    useParagraphPlugin(),
    useBlockquotePlugin(),
    useTodoListPlugin(),
    useHeadingPlugin(),
    useImagePlugin(),
    useLinkPlugin(),
    useListPlugin(),
    useTablePlugin(),
    useMediaEmbedPlugin(),
    useCodeBlockPlugin(),
    useAlignPlugin(),
    useBoldPlugin(),
    useCodePlugin(),
    useItalicPlugin(),
    useHighlightPlugin(),
    useFindReplacePlugin(),
    useUnderlinePlugin(),
    useStrikethroughPlugin(),
    useSubscriptPlugin(),
    useSuperscriptPlugin(),
    useNodeIdPlugin(),
    useAutoformatPlugin(optionsAutoformat),
    useResetNodePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
    useNormalizeTypesPlugin({
      rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
    }),
    useTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type, level: 1 }),
    useSelectOnBackspacePlugin({ allow: options[ELEMENT_IMAGE].type }),
    mentionPlugin,
    searchHighlightPlugin,
  ];

  plugins.push(useDeserializeHTMLPlugin({ plugins }));

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
