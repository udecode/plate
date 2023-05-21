import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createFindReplacePlugin } from '@udecode/plate-find-replace';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createNormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { playgroundValue } from 'www/src/components/playgroundValue';

import { createPlugins, Plate } from '@/core/src/index';
import { createPlateUI } from '@/lib/createPlateUI';
import { createBasicElementsPlugin } from '@/nodes/basic-elements/src/index';
import { createLinkPlugin } from '@/nodes/link/src/index';
import { createMentionPlugin } from '@/nodes/mention/src/index';
import { AlignToolbarButtons } from '@/plate/align/AlignToolbarButtons';
import { autoformatPlugin } from '@/plate/autoformat/autoformatPlugin';
import { MarkBalloonToolbar } from '@/plate/balloon-toolbar/MarkBalloonToolbar';
import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from '@/plate/basic-marks/BasicMarkToolbarButtons';
import { editableProps } from '@/plate/common/editableProps';
import { Icons } from '@/plate/common/icons';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { SearchHighlightToolbar } from '@/plate/find-replace/SearchHighlightToolbar';
import { forcedLayoutPlugin } from '@/plate/forced-layout/forcedLayoutPlugin';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { LineHeightToolbarDropdown } from '@/plate/line-height/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { ListToolbarButtons } from '@/plate/list/ListToolbarButtons';
import { ImageToolbarButton } from '@/plate/media/ImageToolbarButton';
import { MediaEmbedToolbarButton } from '@/plate/media/MediaEmbedToolbarButton';
import { MentionCombobox } from '@/plate/mention/MentionCombobox';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/select-on-backspace/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { TableToolbarButtons } from '@/plate/table/TableToolbarButtons';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { trailingBlockPlugin } from '@/plate/trailing-block/trailingBlockPlugin';

function PlateContainer() {
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
      createAutoformatPlugin(autoformatPlugin as any),
      createResetNodePlugin(resetBlockTypePlugin as any),
      createSoftBreakPlugin(softBreakPlugin as any),
      createExitBreakPlugin(exitBreakPlugin as any),
      createNormalizeTypesPlugin(forcedLayoutPlugin as any),
      createTrailingBlockPlugin(trailingBlockPlugin as any),
      createSelectOnBackspacePlugin(selectOnBackspacePlugin as any),
    ],
    {
      components: createPlateUI(),
    }
  );

  return (
    <Plate
      editableProps={editableProps as any}
      initialValue={playgroundValue}
      plugins={plugins}
    >
      <SearchHighlightToolbar icon={Icons.search} setSearch={setSearch} />
      <HeadingToolbar>
        <BasicElementToolbarButtons />
        <ListToolbarButtons />
        <IndentToolbarButtons />
        <BasicMarkToolbarButtons />
        <AlignToolbarButtons />
        <LineHeightToolbarDropdown icon={<Icons.lineHeight />} />
        <LinkToolbarButton icon={<Icons.link />} />
        <ImageToolbarButton icon={<Icons.image />} />
        <MediaEmbedToolbarButton icon={<Icons.embed />} />
        <TableToolbarButtons />
      </HeadingToolbar>

      <MarkBalloonToolbar />

      <MentionCombobox />
    </Plate>
  );
}

describe('when all plugins', () => {
  it('should render', () => {
    render(<PlateContainer />);

    expect(1).toBe(1);
  });
});
