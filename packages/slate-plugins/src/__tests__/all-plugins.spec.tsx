import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  getHistoryPlugin,
  getReactPlugin,
  SlatePlugins,
} from '@udecode/slate-plugins-core';
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
import { getAutoformatPlugin } from '../../../autoformat/src/getAutoformatPlugin';
import { getExitBreakPlugin } from '../../../break/src/exit-break/getExitBreakPlugin';
import { getSoftBreakPlugin } from '../../../break/src/soft-break/getSoftBreakPlugin';
import { getAlignPlugin } from '../../../elements/alignment/src/getAlignPlugin';
import { getBasicElementPlugins } from '../../../elements/basic-elements/src/getBasicElementPlugins';
import { getBlockquotePlugin } from '../../../elements/block-quote/src/getBlockquotePlugin';
import { ELEMENT_H1 } from '../../../elements/heading/src/defaults';
import { getHeadingPlugin } from '../../../elements/heading/src/getHeadingPlugin';
import { ELEMENT_IMAGE } from '../../../elements/image/src/defaults';
import { getImagePlugin } from '../../../elements/image/src/getImagePlugin';
import { ToolbarImage } from '../../../elements/image-ui/src/ToolbarImage/ToolbarImage';
import { getLinkPlugin } from '../../../elements/link/src/getLinkPlugin';
import { ToolbarLink } from '../../../elements/link-ui/src/ToolbarLink/ToolbarLink';
import { getListPlugin } from '../../../elements/list/src/getListPlugin';
import { getTodoListPlugin } from '../../../elements/list/src/todo-list/getTodoListPlugin';
import { getMediaEmbedPlugin } from '../../../elements/media-embed/src/getMediaEmbedPlugin';
import { useMentionPlugin } from '../../../elements/mention/src/useMentionPlugin';
import { MentionSelect } from '../../../elements/mention-ui/src/MentionSelect/MentionSelect';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { getTablePlugin } from '../../../elements/table/src/getTablePlugin';
import { useFindReplacePlugin } from '../../../find-replace/src/useFindReplacePlugin';
import { ToolbarSearchHighlight } from '../../../find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { getBasicMarkPlugins } from '../../../marks/basic-marks/src/getBasicMarkPlugins';
import { getHighlightPlugin } from '../../../marks/highlight/src/getHighlightPlugin';
import { getNodeIdPlugin } from '../../../node-id/src/getNodeIdPlugin';
import { getNormalizeTypesPlugin } from '../../../normalizers/src/getNormalizeTypesPlugin';
import { getResetNodePlugin } from '../../../reset-node/src/getResetNodePlugin';
import { getSelectOnBackspacePlugin } from '../../../select/src/getSelectOnBackspacePlugin';
import { getDeserializeHTMLPlugin } from '../../../serializers/html-serializer/src/deserializer/getDeserializeHTMLPlugin';
import { getTrailingBlockPlugin } from '../../../trailing-block/src/getTrailingBlockPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { getSlatePluginsComponents } from '../utils/getSlatePluginsComponents';
import { getSlatePluginsOptions } from '../utils/getSlatePluginsOptions';

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const SlatePluginsContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins = [
    getReactPlugin(),
    getHistoryPlugin(),
    getBlockquotePlugin(),
    getTodoListPlugin(),
    getHeadingPlugin({ levels: 5 }),
    ...getBasicElementPlugins(),
    ...getBasicMarkPlugins(),
    getTodoListPlugin(),
    getImagePlugin(),
    getLinkPlugin(),
    getListPlugin(),
    getTablePlugin(),
    getMediaEmbedPlugin(),
    getAlignPlugin(),
    getHighlightPlugin(),
    mentionPlugin,
    findReplacePlugin,
    getNodeIdPlugin(),
    getAutoformatPlugin(optionsAutoformat),
    getResetNodePlugin(optionsResetBlockTypePlugin),
    getSoftBreakPlugin(optionsSoftBreakPlugin),
    getExitBreakPlugin(optionsExitBreakPlugin),
    getNormalizeTypesPlugin({
      rules: [{ path: [0, 0], strictType: options[ELEMENT_H1].type }],
    }),
    getTrailingBlockPlugin({ type: options[ELEMENT_PARAGRAPH].type, level: 1 }),
    getSelectOnBackspacePlugin({ allow: options[ELEMENT_IMAGE].type }),
  ];
  plugins.push(getDeserializeHTMLPlugin({ plugins }));

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
