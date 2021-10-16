import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  createHistoryPlugin,
  createReactPlugin,
  Plate,
  PlatePlugin,
  SPEditor,
} from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../../../../docs/src/live/config/components/Toolbars';
import { CONFIG } from '../../../../docs/src/live/config/config';
import { VALUES } from '../../../../docs/src/live/config/values/values';
import { createAutoformatPlugin } from '../../../autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../break/src/soft-break/createSoftBreakPlugin';
import { createAlignPlugin } from '../../../elements/alignment/src/createAlignPlugin';
import { createBasicElementPlugins } from '../../../elements/basic-elements/src/createBasicElementPlugins';
import { createBlockquotePlugin } from '../../../elements/block-quote/src/createBlockquotePlugin';
import { createHeadingPlugin } from '../../../elements/heading/src/createHeadingPlugin';
import { createImagePlugin } from '../../../elements/image/src/createImagePlugin';
import { ToolbarImage } from '../../../elements/image-ui/src/ToolbarImage/ToolbarImage';
import { createLinkPlugin } from '../../../elements/link/src/createLinkPlugin';
import { ToolbarLink } from '../../../elements/link-ui/src/ToolbarLink/ToolbarLink';
import { createListPlugin } from '../../../elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../elements/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../../../elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../../../elements/mention-ui/src/MentionCombobox';
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
import { createPlateComponents } from '../utils/createPlateComponents';
import { createPlateOptions } from '../utils/createPlateOptions';

const components = createPlateComponents();
const options = createPlateOptions();

const PlateContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();

  const plugins: PlatePlugin<SPEditor & ReactEditor>[] = [
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
    createMentionPlugin(),
    findReplacePlugin,
    createNodeIdPlugin(),
    createAutoformatPlugin(CONFIG.autoformat),
    createResetNodePlugin(CONFIG.resetBlockType),
    createSoftBreakPlugin(CONFIG.softBreak),
    createExitBreakPlugin(CONFIG.exitBreak),
    createNormalizeTypesPlugin(CONFIG.forceLayout),
    createTrailingBlockPlugin(CONFIG.trailingBlock),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ];
  plugins.push(createDeserializeHTMLPlugin({ plugins }));

  return (
    <Plate
      plugins={plugins}
      components={components}
      options={options}
      editableProps={CONFIG.editableProps}
      initialValue={VALUES.playground}
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

      <MentionCombobox />
    </Plate>
  );
};

it('should render', () => {
  render(<PlateContainer />);

  expect(1).toBe(1);
});
