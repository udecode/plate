import React, { useState } from 'react';
import {
  Image,
  LineWeight,
  Link,
  OndemandVideo,
  Search,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import { Plate } from '@udecode/plate-core/src/index';
import {
  createBasicElementsPlugin,
  createFindReplacePlugin,
  createHeadingPlugin,
  createPlugins,
} from '@udecode/plate-headless';
import { ImageToolbarButton } from '@udecode/plate-ui-media/src/index';
import { AlignToolbarButtons } from 'examples/src/align/AlignToolbarButtons';
import { MarkBalloonToolbar } from 'examples/src/balloon-toolbar/MarkBalloonToolbar';
import { BasicElementToolbarButtons } from 'examples/src/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from 'examples/src/basic-marks/BasicMarkToolbarButtons';
import { editableProps } from 'examples/src/common/editableProps';
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
import { autoformatPlugin } from '../../../../examples/src/autoformat/autoformatPlugin';
import { createAutoformatPlugin } from '../../../editor/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../editor/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../editor/normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../editor/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../editor/select/src/createSelectOnBackspacePlugin';
import { createTrailingBlockPlugin } from '../../../editor/trailing-block/src/createTrailingBlockPlugin';
import { createImagePlugin } from '../../../media/src/image/createImagePlugin';
import { createMediaEmbedPlugin } from '../../../media/src/media-embed/createMediaEmbedPlugin';
import { createAlignPlugin } from '../../../nodes/alignment/src/createAlignPlugin';
import { createBasicMarksPlugin } from '../../../nodes/basic-marks/src/createBasicMarksPlugin';
import { createBlockquotePlugin } from '../../../nodes/block-quote/src/createBlockquotePlugin';
import { createHighlightPlugin } from '../../../nodes/highlight/src/createHighlightPlugin';
import { createLinkPlugin } from '../../../nodes/link/src/createLinkPlugin';
import { createListPlugin } from '../../../nodes/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../nodes/list/src/todo-list/createTodoListPlugin';
import { createMentionPlugin } from '../../../nodes/mention/src/createMentionPlugin';
import { createTablePlugin } from '../../../nodes/table/src/createTablePlugin';
import { SearchHighlightToolbar } from '../../../ui/find-replace/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { LineHeightToolbarDropdown } from '../../../ui/nodes/line-height/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '../../../ui/nodes/link/src/LinkToolbarButton/LinkToolbarButton';
import { MediaEmbedToolbarButton } from '../../../ui/nodes/media/src/MediaEmbedToolbarButton/MediaEmbedToolbarButton';
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

      <MarkBalloonToolbar />

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
