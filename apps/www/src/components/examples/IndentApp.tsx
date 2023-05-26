import React from 'react';
import { createIndentPlugin, Plate, PlateProvider } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { indentPlugin } from '@/plate/demo/plugins/indentPlugin';
import { indentValue } from '@/plate/demo/values/indentValue';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

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
        <IndentToolbarButtons />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
