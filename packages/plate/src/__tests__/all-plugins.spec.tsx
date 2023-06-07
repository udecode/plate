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

import { SearchHighlightToolbar } from '@/components/examples/FindReplaceApp';
import { Icons } from '@/components/icons';
import { AlignDropdownMenu } from '@/components/plate-ui/align-dropdown-menu';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { LinkToolbarButton } from '@/components/plate-ui/link-toolbar-button';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';
import { OutdentToolbarButton } from '@/components/plate-ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/components/plate-ui/table-dropdown-menu';
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu';
import { createPlugins, Plate } from '@/core/src/index';
import { createBasicElementsPlugin } from '@/nodes/basic-elements/src/index';
import { createLinkPlugin } from '@/nodes/link/src/index';
import { createMentionPlugin } from '@/nodes/mention/src/index';
import { MarkBalloonToolbar } from '@/plate/balloon-toolbar/MarkBalloonToolbar';
import { createPlateUI } from '@/plate/createPlateUI';
import { editableProps } from '@/plate/demo/editableProps';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { forcedLayoutPlugin } from '@/plate/demo/plugins/forcedLayoutPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { selectOnBackspacePlugin } from '@/plate/demo/plugins/selectOnBackspacePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { playgroundValue } from '@/plate/demo/values/usePlaygroundValue';
import { ListToolbarButtons } from '@/plate/list/ListToolbarButtons';

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
      <FixedToolbar>
        <TurnIntoDropdownMenu />
        <ListToolbarButtons />
        <OutdentToolbarButton />
        <AlignDropdownMenu />
        <LinkToolbarButton icon={<Icons.link />} />
        <TableDropdownMenu />
      </FixedToolbar>

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
