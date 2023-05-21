import React from 'react';
import { createExitBreakPlugin, Plate } from '@udecode/plate';

import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { placeholderValue } from '@/plate/placeholder/placeholderValue';
import { withStyledPlaceHolders } from '@/plate/placeholder/withStyledPlaceHolders';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const components = withStyledPlaceHolders(plateUI);

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
        <BasicElementToolbarButtons />
      </HeadingToolbar>

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={placeholderValue}
      />
    </>
  );
}
