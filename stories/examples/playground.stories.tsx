import 'tippy.js/dist/tippy.css';
import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import {
  ELEMENT_H1,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  useAlignPlugin,
  useAutoformatPlugin,
  useBlockquotePlugin,
  useBoldPlugin,
  useCodeBlockPlugin,
  useCodePlugin,
  useExitBreakPlugin,
  useHeadingPlugin,
  useHighlightPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useItalicPlugin,
  useLinkPlugin,
  useListPlugin,
  useMarksPlugin,
  useMediaEmbedPlugin,
  useMentionPlugin,
  useNodeIdPlugin,
  useNormalizeTypesPlugin,
  useParagraphPlugin,
  useReactPlugin,
  useResetBlockTypePlugin,
  useSearchHighlightPlugin,
  useSelectOnBackspacePlugin,
  useSoftBreakPlugin,
  useStrikethroughPlugin,
  useSubscriptPlugin,
  useSuperscriptPlugin,
  useTablePlugin,
  useTodoListPlugin,
  useTrailingNodePlugin,
  useUnderlinePlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  HeadingToolbar,
  MentionSelect,
  ToolbarImage,
  ToolbarLink,
  ToolbarSearchHighlight,
} from '@udecode/slate-plugins-components';
import { useDeserializeHTMLPlugin } from '@udecode/slate-plugins-html-serializer';
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

const defaultComponents = getSlatePluginsComponents();
const defaultOptions = getSlatePluginsOptions();

export const Plugins = ({
  components = defaultComponents,
  options = defaultOptions,
}: any) => {
  const { setSearch, ...searchHighlightPlugin } = useSearchHighlightPlugin();
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
    useMentionPlugin(),
    useTablePlugin(),
    useMediaEmbedPlugin(),
    useCodeBlockPlugin(),
    useAlignPlugin(),
    useBoldPlugin(),
    useCodePlugin(),
    useItalicPlugin(),
    useHighlightPlugin(),
    useSearchHighlightPlugin(),
    useUnderlinePlugin(),
    useStrikethroughPlugin(),
    useSubscriptPlugin(),
    useSuperscriptPlugin(),
    mentionPlugin,
    searchHighlightPlugin,
    useMarksPlugin(),
    useNodeIdPlugin(),
    useAutoformatPlugin(optionsAutoformat),
    useResetBlockTypePlugin(optionsResetBlockTypePlugin),
    useSoftBreakPlugin(optionsSoftBreakPlugin),
    useExitBreakPlugin(optionsExitBreakPlugin),
    useNormalizeTypesPlugin({
      rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
    }),
    useTrailingNodePlugin({ type: options[ELEMENT_PARAGRAPH].type, level: 1 }),
    useSelectOnBackspacePlugin({ allow: options[ELEMENT_IMAGE].type }),
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
