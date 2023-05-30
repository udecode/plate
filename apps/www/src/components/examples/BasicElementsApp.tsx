import React from 'react';
import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { TurnIntoDropdownMenu } from '@/plate/toolbar/turn-into-dropdown-menu';

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function BasicElementsApp() {
  return (
    <PlateProvider<MyValue> initialValue={basicElementsValue} plugins={plugins}>
      <HeadingToolbar>
        <TurnIntoDropdownMenu />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
