import React from 'react';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { createResetNodePlugin } from '@udecode/plate-reset-node';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
      <FixedToolbar>
        <TurnIntoDropdownMenu />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
