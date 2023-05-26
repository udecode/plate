import React from 'react';
import { createExitBreakPlugin, Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { placeholderValue } from '@/plate/demo/values/placeholderValue';
import { withPlaceHolders } from '@/plate/placeholder/withPlaceHolders';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { TurnIntoDropdownMenu } from '@/plate/toolbar/TurnIntoDropdownMenu';

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
      <HeadingToolbar>
        <TurnIntoDropdownMenu />
      </HeadingToolbar>

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={placeholderValue}
      />
    </>
  );
}
