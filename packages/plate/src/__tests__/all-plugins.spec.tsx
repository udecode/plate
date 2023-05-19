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
import { createPlateUI } from '@udecode/plate-ui/src/utils/createPlateUI';
import { SearchHighlightToolbar } from '@udecode/plate-ui-find-replace/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { LineHeightToolbarDropdown } from '@udecode/plate-ui-line-height/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '@udecode/plate-ui-link/src/LinkToolbarButton/LinkToolbarButton';
import { ImageToolbarButton } from '@udecode/plate-ui-media/src/index';
import { MediaEmbedToolbarButton } from '@udecode/plate-ui-media/src/MediaEmbedToolbarButton/MediaEmbedToolbarButton';
import { MentionCombobox } from '@udecode/plate-ui-mention/src/MentionCombobox/MentionCombobox';
import { HeadingToolbar } from '@udecode/plate-ui-toolbar/src/HeadingToolbar/HeadingToolbar';
import { AlignToolbarButtons } from 'examples/src/align/AlignToolbarButtons';
import { autoformatPlugin } from 'examples/src/autoformat/autoformatPlugin';
import { MarkBalloonToolbar } from 'examples/src/balloon-toolbar/MarkBalloonToolbar';
import { BasicElementToolbarButtons } from 'examples/src/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from 'examples/src/basic-marks/BasicMarkToolbarButtons';
import { editableProps } from 'examples/src/common/editableProps';
import { Icons } from 'examples/src/common/icons';
import { exitBreakPlugin } from 'examples/src/exit-break/exitBreakPlugin';
import { forcedLayoutPlugin } from 'examples/src/forced-layout/forcedLayoutPlugin';
import { IndentToolbarButtons } from 'examples/src/indent/IndentToolbarButtons';
import { ListToolbarButtons } from 'examples/src/list/ListToolbarButtons';
import { playgroundValue } from 'examples/src/playgroundValue';
import { resetBlockTypePlugin } from 'examples/src/reset-node/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from 'examples/src/select-on-backspace/selectOnBackspacePlugin';
import { softBreakPlugin } from 'examples/src/soft-break/softBreakPlugin';
import { TableToolbarButtons } from 'examples/src/table/TableToolbarButtons';
import { trailingBlockPlugin } from 'examples/src/trailing-block/trailingBlockPlugin';

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
