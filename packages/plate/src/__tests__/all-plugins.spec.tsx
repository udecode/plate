import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createAlignPlugin } from '@udecode/plate-alignment/src/createAlignPlugin';
import { createAutoformatPlugin } from '@udecode/plate-autoformat/src/createAutoformatPlugin';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks/src/createBasicMarksPlugin';
import { createBlockquotePlugin } from '@udecode/plate-block-quote/src/createBlockquotePlugin';
import { createExitBreakPlugin } from '@udecode/plate-break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '@udecode/plate-break/src/soft-break/createSoftBreakPlugin';
import { Plate } from '@udecode/plate-core/src/index';
import {
  createBasicElementsPlugin,
  createFindReplacePlugin,
  createHeadingPlugin,
  createPlugins,
} from '@udecode/plate-headless';
import { createHighlightPlugin } from '@udecode/plate-highlight/src/createHighlightPlugin';
import { createLinkPlugin } from '@udecode/plate-link/src/createLinkPlugin';
import { createListPlugin } from '@udecode/plate-list/src/createListPlugin';
import { createTodoListPlugin } from '@udecode/plate-list/src/todo-list/createTodoListPlugin';
import { createImagePlugin } from '@udecode/plate-media/src/image/createImagePlugin';
import { createMediaEmbedPlugin } from '@udecode/plate-media/src/media-embed/createMediaEmbedPlugin';
import { createMentionPlugin } from '@udecode/plate-mention/src/createMentionPlugin';
import { createNodeIdPlugin } from '@udecode/plate-node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '@udecode/plate-normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '@udecode/plate-reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select/src/createSelectOnBackspacePlugin';
import { createTablePlugin } from '@udecode/plate-table/src/createTablePlugin';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block/src/createTrailingBlockPlugin';
import { SearchHighlightToolbar } from '@udecode/plate-ui-find-replace/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { LineHeightToolbarDropdown } from '@udecode/plate-ui-line-height/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { ImageToolbarButton } from '@udecode/plate-ui-media/src/index';
import { MentionCombobox } from '@udecode/plate-ui-mention/src/MentionCombobox/MentionCombobox';
import { AlignToolbarButtons } from 'apps/www/src/align/AlignToolbarButtons';
import { autoformatPlugin } from 'apps/www/src/autoformat/autoformatPlugin';
import { MarkBalloonToolbar } from 'apps/www/src/balloon-toolbar/MarkBalloonToolbar';
import { BasicElementToolbarButtons } from 'apps/www/src/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from 'apps/www/src/basic-marks/BasicMarkToolbarButtons';
import { editableProps } from 'apps/www/src/common/editableProps';
import { Icons } from 'apps/www/src/common/icons';
import { playgroundValue } from 'apps/www/src/components/playgroundValue';
import { createPlateUI } from 'apps/www/src/createPlateUI';
import { exitBreakPlugin } from 'apps/www/src/exit-break/exitBreakPlugin';
import { forcedLayoutPlugin } from 'apps/www/src/forced-layout/forcedLayoutPlugin';
import { IndentToolbarButtons } from 'apps/www/src/indent/IndentToolbarButtons';
import { ListToolbarButtons } from 'apps/www/src/lib/plate/list/ListToolbarButtons';
import { TableToolbarButtons } from 'apps/www/src/lib/plate/table/TableToolbarButtons';
import { resetBlockTypePlugin } from 'apps/www/src/reset-node/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from 'apps/www/src/select-on-backspace/selectOnBackspacePlugin';
import { softBreakPlugin } from 'apps/www/src/soft-break/softBreakPlugin';
import { trailingBlockPlugin } from 'apps/www/src/trailing-block/trailingBlockPlugin';
import { LinkToolbarButton } from 'packages/ui/nodes/link/src/LinkElement/LinkToolbarButton';
import { MediaEmbedToolbarButton } from 'packages/ui/nodes/media/src/ImageElement/MediaEmbedToolbarButton';
import { HeadingToolbar } from 'packages/ui/toolbar/src/BalloonToolbar/HeadingToolbar';

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
