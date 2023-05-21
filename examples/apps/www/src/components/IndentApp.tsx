import React from 'react';
import { createIndentPlugin, Plate, PlateProvider } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { indentPlugin } from '@/plate/indent/indentPlugin';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { indentValue } from '@/plate/indent/indentValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
