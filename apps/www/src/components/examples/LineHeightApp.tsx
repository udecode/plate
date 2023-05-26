import React from 'react';
import { createLineHeightPlugin, Plate, PlateProvider } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { lineHeightValue } from '@/plate/demo/values/lineHeightValue';
import { LineHeightToolbarDropdown } from '@/plate/line-height/LineHeightToolbarDropdown';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLineHeightPlugin(lineHeightPlugin)],
  {
    components: plateUI,
  }
);

export default function LineHeightApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={lineHeightValue}>
      <HeadingToolbar>
        <LineHeightToolbarDropdown />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
