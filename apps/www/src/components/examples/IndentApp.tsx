import React from 'react';
import { createIndentPlugin, Plate, PlateProvider } from '@udecode/plate';

import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { OutdentToolbarButton } from '@/plate/bcomponents/outdent-toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { indentPlugin } from '@/plate/demo/plugins/indentPlugin';
import { indentValue } from '@/plate/demo/values/indentValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createIndentPlugin(indentPlugin)],
  {
    components: plateUI,
  }
);

export default function IndentApp() {
  return (
    <PlateProvider<MyValue> initialValue={indentValue} plugins={plugins}>
      <HeadingToolbar>
        <OutdentToolbarButton />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
