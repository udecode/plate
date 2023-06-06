import React from 'react';
import { createExitBreakPlugin } from '@udecode/plate-break';
import { Plate } from '@udecode/plate-common';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { withPlaceHolders } from '@/components/plate-ui/placeholder';
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { placeholderValue } from '@/plate/demo/values/placeholderValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
