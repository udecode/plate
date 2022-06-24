import React, { useState } from 'react';
import {
  Image,
  LineWeight,
  Link,
  OndemandVideo,
  Search,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  createBasicElementsPlugin,
  createFindReplacePlugin,
  createHeadingPlugin,
  createPlugins,
} from '@udecode/plate-headless';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar,
  TableToolbarButtons,
} from '../../../../examples/next/src/config/components/Toolbars';
import { CONFIG } from '../../../../examples/next/src/config/config';
import { VALUES } from '../../../../examples/next/src/config/values/values';
import { Plate } from '../../../core/src/components/plate/Plate';
import { createAutoformatPlugin } from '../../../editor/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../editor/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../editor/normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../editor/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../editor/select/src/createSelectOnBackspacePlugin';
import { createTrailingBlockPlugin } from '../../../editor/trailing-block/src/createTrailingBlockPlugin';
import { createAlignPlugin } from '../../../nodes/alignment/src/createAlignPlugin';
import { createBasicMarksPlugin } from '../../../nodes/basic-marks/src/createBasicMarksPlugin';
import { createBlockquotePlugin } from '../../../nodes/block-quote/src/createBlockquotePlugin';
import { createHighlightPlugin } from '../../../nodes/highlight/src/createHighlightPlugin';
import { createImagePlugin } from '../../../nodes/image/src/createImagePlugin';
import { createLinkPlugin } from '../../../nodes/link/src/createLinkPlugin';
import { createListPlugin } from '../../../nodes/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../nodes/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../nodes/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../../../nodes/mention/src/createMentionPlugin';
import { createTablePlugin } from '../../../nodes/table/src/createTablePlugin';
import { SearchHighlightToolbar } from '../../../ui/find-replace/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { ImageToolbarButton } from '../../../ui/nodes/image/src/ImageToolbarButton/ImageToolbarButton';
import { LineHeightToolbarDropdown } from '../../../ui/nodes/line-height/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '../../../ui/nodes/link/src/LinkToolbarButton/LinkToolbarButton';
import { MediaEmbedToolbarButton } from '../../../ui/nodes/media-embed/src/MediaEmbedToolbarButton/MediaEmbedToolbarButton';
import { MentionCombobox } from '../../../ui/nodes/mention/src/MentionCombobox';
import { createPlateUI } from '../../../ui/plate/src/utils/createPlateUI';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';

const PlateContainer = () => {
  const [search, setSearch] = useState();

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
      createFindReplacePlugin({ options: { search } }),
      createNodeIdPlugin(),
      // TODO: fix type
      createAutoformatPlugin(CONFIG.autoformat as any),
      createResetNodePlugin(CONFIG.resetBlockType as any),
      createSoftBreakPlugin(CONFIG.softBreak as any),
      createExitBreakPlugin(CONFIG.exitBreak as any),
      createNormalizeTypesPlugin(CONFIG.forceLayout as any),
      createTrailingBlockPlugin(CONFIG.trailingBlock as any),
      createSelectOnBackspacePlugin(CONFIG.selectOnBackspace as any),
    ],
    {
      components: createPlateUI(),
    }
  );

  return (
    <Plate
      editableProps={CONFIG.editableProps as any}
      initialValue={VALUES.playground}
      plugins={plugins}
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

describe('when all plugins', () => {
  it('should render', () => {
    render(<PlateContainer />);

    expect(1).toBe(1);
  });
});
