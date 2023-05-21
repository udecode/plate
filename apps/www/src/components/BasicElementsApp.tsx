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
import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
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
        <BasicElementToolbarButtons />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
