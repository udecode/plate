import React from 'react';
import { createHighlightPlugin, Plate, PlateProvider } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { highlightValue } from '@/plate/demo/values/highlightValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: plateUI,
  }
);

export default function HighlightApp() {
  return (
    <PlateProvider<MyValue> initialValue={highlightValue} plugins={plugins}>
      <HeadingToolbar>{/* <HighlightToolbarButton /> */}</HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
