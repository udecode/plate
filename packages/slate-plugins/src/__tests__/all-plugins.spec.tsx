import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  createHistoryPlugin,
  createReactPlugin,
  SlatePlugin,
  SlatePlugins,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { ReactEditor } from 'slate-react';
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
import { createAutoformatPlugin } from '../../../autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../break/src/soft-break/createSoftBreakPlugin';
import { createAlignPlugin } from '../../../elements/alignment/src/createAlignPlugin';
import { createBasicElementPlugins } from '../../../elements/basic-elements/src/createBasicElementPlugins';
import { createBlockquotePlugin } from '../../../elements/block-quote/src/createBlockquotePlugin';
import { createHeadingPlugin } from '../../../elements/heading/src/createHeadingPlugin';
import { ELEMENT_H1 } from '../../../elements/heading/src/defaults';
import { createImagePlugin } from '../../../elements/image/src/createImagePlugin';
import { ELEMENT_IMAGE } from '../../../elements/image/src/defaults';
import { ToolbarImage } from '../../../elements/image-ui/src/ToolbarImage/ToolbarImage';
import { createLinkPlugin } from '../../../elements/link/src/createLinkPlugin';
import { ToolbarLink } from '../../../elements/link-ui/src/ToolbarLink/ToolbarLink';
import { createListPlugin } from '../../../elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../elements/media-embed/src/createMediaEmbedPlugin';
import { useMentionPlugin } from '../../../elements/mention/src/useMentionPlugin';
import { MentionSelect } from '../../../elements/mention-ui/src/MentionSelect/MentionSelect';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { createTablePlugin } from '../../../elements/table/src/createTablePlugin';
import { useFindReplacePlugin } from '../../../find-replace/src/useFindReplacePlugin';
import { ToolbarSearchHighlight } from '../../../find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { createBasicMarkPlugins } from '../../../marks/basic-marks/src/createBasicMarkPlugins';
import { createHighlightPlugin } from '../../../marks/highlight/src/createHighlightPlugin';
import { createNodeIdPlugin } from '../../../node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../select/src/createSelectOnBackspacePlugin';
import { createDeserializeHTMLPlugin } from '../../../serializers/html-serializer/src/deserializer/createDeserializeHTMLPlugin';
import { createTrailingBlockPlugin } from '../../../trailing-block/src/createTrailingBlockPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { createSlatePluginsComponents } from '../utils/createSlatePluginsComponents';
import { createSlatePluginsOptions } from '../utils/createSlatePluginsOptions';

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();

const SlatePluginsContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();
  const { getMentionSelectProps, plugin: mentionPlugin } = useMentionPlugin(
    optionsMentionPlugin
  );

  const plugins: SlatePlugin<SPEditor & ReactEditor>[] = [
    createReactPlugin(),
    createHistoryPlugin(),
    createBlockquotePlugin(),
    createTodoListPlugin(),
    createHeadingPlugin({ levels: 5 }),
    ...createBasicElementPlugins(),
    ...createBasicMarkPlugins(),
    createTodoListPlugin(),
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createMediaEmbedPlugin(),
    createAlignPlugin(),
    createHighlightPlugin(),
    mentionPlugin,
    findReplacePlugin,
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
  ];
  plugins.push(createDeserializeHTMLPlugin({ plugins }));

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
