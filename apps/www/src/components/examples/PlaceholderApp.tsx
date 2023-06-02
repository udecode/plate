import React from 'react';
import { createExitBreakPlugin, Plate } from '@udecode/plate';

import { FixedToolbar } from '@/plate/aui/fixed-toolbar';
import { withPlaceHolders } from '@/plate/aui/placeholder';
import { TurnIntoDropdownMenu } from '@/plate/aui/turn-into-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { placeholderValue } from '@/plate/demo/values/placeholderValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const components = withPlaceHolders(plateUI);

const plugins = createMyPlugins(
  [...basicNodesPlugins, createExitBreakPlugin(exitBreakPlugin)],
  {
    components,
  }
);

export default function PlaceholderApp() {
  return (
    <>
      <FixedToolbar>
        <TurnIntoDropdownMenu />
      </FixedToolbar>

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={placeholderValue}
      />
    </>
  );
}
