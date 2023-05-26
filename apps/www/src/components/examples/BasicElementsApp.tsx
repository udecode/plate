import React from 'react';
import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { basicElementsValue } from '@/plate/basic-elements/basicElementsValue';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { TurnIntoDropdownMenu } from '@/plate/toolbar/TurnIntoDropdownMenu';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
