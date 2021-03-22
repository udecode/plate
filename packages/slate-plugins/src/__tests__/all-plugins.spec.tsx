import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import { optionsAutoformat } from '../../../../stories/config/autoformatRules';
import { initialValuePlayground } from '../../../../stories/config/initialValues';
import {
  editableProps,
  optionsExitBreakPlugin,
  optionsMentionPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../../../stories/config/pluginOptions';
import { renderMentionLabel } from '../../../../stories/config/renderMentionLabel';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../../../../stories/config/Toolbars';
import { useAutoformatPlugin } from '../../../autoformat/src/useAutoformatPlugin';
import { useExitBreakPlugin } from '../../../break/src/exit-break/useExitBreakPlugin';
import { useSoftBreakPlugin } from '../../../break/src/soft-break/useSoftBreakPlugin';
import { SlatePlugins } from '../../../core/src/components/SlatePlugins';
import { useHistoryPlugin } from '../../../core/src/plugins/useHistoryPlugin';
import { useReactPlugin } from '../../../core/src/plugins/useReactPlugin';
import { useAlignPlugin } from '../../../elements/alignment/src/useAlignPlugin';
import { useBasicElementPlugins } from '../../../elements/basic-elements/src/useBasicElementPlugins';
import { useBlockquotePlugin } from '../../../elements/block-quote/src/useBlockquotePlugin';
import { ELEMENT_H1 } from '../../../elements/heading/src/defaults';
import { useHeadingPlugin } from '../../../elements/heading/src/useHeadingPlugin';
import { ELEMENT_IMAGE } from '../../../elements/image/src/defaults';
import { useImagePlugin } from '../../../elements/image/src/useImagePlugin';
import { ToolbarImage } from '../../../elements/image-ui/src/ToolbarImage/ToolbarImage';
import { useLinkPlugin } from '../../../elements/link/src/useLinkPlugin';
import { ToolbarLink } from '../../../elements/link-ui/src/ToolbarLink/ToolbarLink';
import { useTodoListPlugin } from '../../../elements/list/src/todo-list/useTodoListPlugin';
import { useListPlugin } from '../../../elements/list/src/useListPlugin';
import { useMediaEmbedPlugin } from '../../../elements/media-embed/src/useMediaEmbedPlugin';
import { useMentionPlugin } from '../../../elements/mention/src/useMentionPlugin';
import { MentionSelect } from '../../../elements/mention-ui/src/MentionSelect/MentionSelect';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { useTablePlugin } from '../../../elements/table/src/useTablePlugin';
import { useFindReplacePlugin } from '../../../find-replace/src/useFindReplacePlugin';
import { ToolbarSearchHighlight } from '../../../find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { useBasicMarkPlugins } from '../../../marks/basic-marks/src/useBasicMarkPlugins';
import { useHighlightPlugin } from '../../../marks/highlight/src/useHighlightPlugin';
import { useNodeIdPlugin } from '../../../node-id/src/useNodeIdPlugin';
import { useNormalizeTypesPlugin } from '../../../normalizers/src/useNormalizeTypesPlugin';
import { useResetNodePlugin } from '../../../reset-node/src/useResetNodePlugin';
import { useSelectOnBackspacePlugin } from '../../../select/src/useSelectOnBackspacePlugin';
import { useDeserializeHTMLPlugin } from '../../../serializers/html-serializer/src/deserializer/useDeserializeHTMLPlugin';
import { useTrailingBlockPlugin } from '../../../trailing-block/src/useTrailingBlockPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { getSlatePluginsComponents } from '../utils/getSlatePluginsComponents';
import { getSlatePluginsOptions } from '../utils/getSlatePluginsOptions';

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const SlatePluginsContainer = () => {
  const { setSearch, ...searchHighlightPlugin } = useFindReplacePlugin();
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
    useFindReplacePlugin(),
    mentionPlugin,
    searchHighlightPlugin,
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
