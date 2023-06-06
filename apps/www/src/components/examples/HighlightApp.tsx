import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { createHighlightPlugin } from '@udecode/plate-highlight';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { highlightValue } from '@/plate/demo/values/highlightValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: plateUI,
  }
);

export default function HighlightApp() {
  return (
    <PlateProvider<MyValue> initialValue={highlightValue} plugins={plugins}>
      <FixedToolbar>{/* <HighlightToolbarButton /> */}</FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
