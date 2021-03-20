import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import { optionsAutoformat } from '../../../../../stories/config/autoformatRules';
import { initialValuePlayground } from '../../../../../stories/config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsMentionPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../../../../stories/config/pluginOptions';
import { renderMentionLabel } from '../../../../../stories/config/renderMentionLabel';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../../../../../stories/config/Toolbars';
import { MentionSelect } from '../../../../components/src/components/MentionSelect/MentionSelect';
import { HeadingToolbar } from '../../../../components/src/components/Toolbar/HeadingToolbar/HeadingToolbar';
import { ToolbarImage } from '../../../../components/src/components/ToolbarImage/ToolbarImage';
import { ToolbarLink } from '../../../../components/src/components/ToolbarLink/ToolbarLink';
import { ToolbarSearchHighlight } from '../../../../components/src/components/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { getSlatePluginsComponents } from '../../../../components/src/utils/getSlatePluginsComponents';
import { useDeserializeHTMLPlugin } from '../../../../slate-plugins/src/deserializers/deserialize-html/useDeserializeHTMLPlugin';
import { useAlignPlugin } from '../../../../slate-plugins/src/elements/align/useAlignPlugin';
import { useBasicElementPlugins } from '../../../../slate-plugins/src/elements/basic-elements/useBasicElementPlugins';
import { useBlockquotePlugin } from '../../../../slate-plugins/src/elements/blockquote/useBlockquotePlugin';
import { ELEMENT_H1 } from '../../../../slate-plugins/src/elements/heading/defaults';
import { useHeadingPlugin } from '../../../../slate-plugins/src/elements/heading/useHeadingPlugin';
import { ELEMENT_IMAGE } from '../../../../slate-plugins/src/elements/image/defaults';
import { useImagePlugin } from '../../../../slate-plugins/src/elements/image/useImagePlugin';
import { useLinkPlugin } from '../../../../slate-plugins/src/elements/link/useLinkPlugin';
import { useListPlugin } from '../../../../slate-plugins/src/elements/list/useListPlugin';
import { useMediaEmbedPlugin } from '../../../../slate-plugins/src/elements/media-embed/useMediaEmbedPlugin';
import { useMentionPlugin } from '../../../../slate-plugins/src/elements/mention/useMentionPlugin';
import { ELEMENT_PARAGRAPH } from '../../../../slate-plugins/src/elements/paragraph/defaults';
import { useTablePlugin } from '../../../../slate-plugins/src/elements/table/useTablePlugin';
import { useTodoListPlugin } from '../../../../slate-plugins/src/elements/todo-list/useTodoListPlugin';
import { useBasicMarkPlugins } from '../../../../slate-plugins/src/marks/basic-marks/useBasicMarkPlugins';
import { useHighlightPlugin } from '../../../../slate-plugins/src/marks/highlight/useHighlightPlugin';
import { useMarksPlugin } from '../../../../slate-plugins/src/marks/useMarksPlugin';
import { useAutoformatPlugin } from '../../../../slate-plugins/src/plugins/autoformat/useAutoformatPlugin';
import { useExitBreakPlugin } from '../../../../slate-plugins/src/plugins/exit-break/useExitBreakPlugin';
import { useResetBlockTypePlugin } from '../../../../slate-plugins/src/plugins/reset-block-type/useResetBlockTypePlugin';
import { useSoftBreakPlugin } from '../../../../slate-plugins/src/plugins/soft-break/useSoftBreakPlugin';
import { useNodeIdPlugin } from '../../../../slate-plugins/src/plugins/useNodeIdPlugin';
import { useNormalizeTypesPlugin } from '../../../../slate-plugins/src/plugins/useNormalizeTypesPlugin';
import { useSelectOnBackspacePlugin } from '../../../../slate-plugins/src/plugins/useSelectOnBackspacePlugin';
import { useTrailingNodePlugin } from '../../../../slate-plugins/src/plugins/useTrailingNodePlugin';
import { getSlatePluginsOptions } from '../../../../slate-plugins/src/utils/getSlatePluginsOptions';
import { useSearchHighlightPlugin } from '../../../../slate-plugins/src/widgets/search-highlight/useSearchHighlightPlugin';
import { SlatePlugins } from '../../components/SlatePlugins';
import { useHistoryPlugin } from '../../plugins/useHistoryPlugin';
import { useReactPlugin } from '../../plugins/useReactPlugin';

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const SlatePluginsContainer = () => {
  const { setSearch, ...searchHighlightPlugin } = useSearchHighlightPlugin();
  const { getMentionSelectProps, ...mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    useBlockquotePlugin(),
    useTodoListPlugin(),
    useHeadingPlugin({ levels: 5 }),
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useTodoListPlugin(),
    useImagePlugin(),
    useLinkPlugin(),
    useListPlugin(),
    useMentionPlugin(),
    useTablePlugin(),
    useMediaEmbedPlugin(),
    useAlignPlugin(),
    useHighlightPlugin(),
    useSearchHighlightPlugin(),
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

it('should render', () => {
  render(<SlatePluginsContainer />);

  expect(1).toBe(1);
});
