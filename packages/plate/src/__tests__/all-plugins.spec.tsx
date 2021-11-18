import React from 'react';
import {
  Image,
  LineWeight,
  Link,
  OndemandVideo,
  Search,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createPlugins } from '@udecode/plate-core';
import { createHeadingPlugin } from '@udecode/plate-heading';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar,
  TableToolbarButtons,
} from '../../../../docs/src/live/config/components/Toolbars';
import { CONFIG } from '../../../../docs/src/live/config/config';
import { VALUES } from '../../../../docs/src/live/config/values/values';
import { Plate } from '../../../core/src/components/Plate';
import { useFindReplacePlugin } from '../../../decorators/find-replace/src/useFindReplacePlugin';
import { SearchHighlightToolbar } from '../../../decorators/find-replace-ui/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { createAutoformatPlugin } from '../../../editor/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../editor/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../editor/normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../editor/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../editor/select/src/createSelectOnBackspacePlugin';
import { createTrailingBlockPlugin } from '../../../editor/trailing-block/src/createTrailingBlockPlugin';
import { createAlignPlugin } from '../../../elements/alignment/src/createAlignPlugin';
import { createBlockquotePlugin } from '../../../elements/block-quote/src/createBlockquotePlugin';
import { createImagePlugin } from '../../../elements/image/src/createImagePlugin';
import { ImageToolbarButton } from '../../../elements/image-ui/src/ImageToolbarButton/ImageToolbarButton';
import { LineHeightToolbarDropdown } from '../../../elements/line-height-ui/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { createLinkPlugin } from '../../../elements/link/src/createLinkPlugin';
import { LinkToolbarButton } from '../../../elements/link-ui/src/LinkToolbarButton/LinkToolbarButton';
import { createListPlugin } from '../../../elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../elements/media-embed/src/createMediaEmbedPlugin';
import { MediaEmbedToolbarButton } from '../../../elements/media-embed-ui/src/MediaEmbedToolbarButton/MediaEmbedToolbarButton';
import { createMentionPlugin } from '../../../elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../../../elements/mention-ui/src/MentionCombobox';
import { createTablePlugin } from '../../../elements/table/src/createTablePlugin';
import { createBasicMarksPlugin } from '../../../marks/basic-marks/src/createBasicMarksPlugin';
import { createHighlightPlugin } from '../../../marks/highlight/src/createHighlightPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { createPlateUI } from '../utils/createPlateUI';

const PlateContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();

  const plugins = createPlugins(
    [
      createBlockquotePlugin(),
      createTodoListPlugin(),
      createHeadingPlugin({ options: { levels: 5 } }),
      createBasicElementsPlugin(),
      createBasicMarksPlugin(),
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
    ],
    {
      components: createPlateUI(),
    }
  );

  return (
    <Plate
      plugins={plugins}
      editableProps={CONFIG.editableProps}
      initialValue={VALUES.playground}
    >
      <SearchHighlightToolbar icon={Search} setSearch={setSearch} />
      <HeadingToolbar>
        <BasicElementToolbarButtons />
        <ListToolbarButtons />
        <IndentToolbarButtons />
        <BasicMarkToolbarButtons />
        <AlignToolbarButtons />
        <LineHeightToolbarDropdown icon={<LineWeight />} />
        <LinkToolbarButton icon={<Link />} />
        <ImageToolbarButton icon={<Image />} />
        <MediaEmbedToolbarButton icon={<OndemandVideo />} />
        <TableToolbarButtons />
      </HeadingToolbar>

      <MarkBallonToolbar />

      <MentionCombobox />
    </Plate>
  );
};

it('should render', () => {
  render(<PlateContainer />);

  expect(1).toBe(1);
});
