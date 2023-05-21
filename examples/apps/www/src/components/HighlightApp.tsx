import React from 'react';
import { createHighlightPlugin, Plate, PlateProvider } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { HighlightToolbarButton } from '@/plate/highlight/HighlightToolbarButton';
import { highlightValue } from '@/plate/highlight/highlightValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: plateUI,
  }
);

export default function HighlightApp() {
  return (
    <PlateProvider<MyValue> initialValue={highlightValue} plugins={plugins}>
      <HeadingToolbar>
        <HighlightToolbarButton />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
