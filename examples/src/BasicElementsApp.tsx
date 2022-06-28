import React from 'react';
import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createPlateUI,
  createResetNodePlugin,
  createSoftBreakPlugin,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { editableProps } from './common/editableProps';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { createMyPlugins } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <BasicElementToolbarButtons />
    </HeadingToolbar>

    <Plate
      id="basic-elements"
      editableProps={editableProps}
      initialValue={basicElementsValue}
      plugins={plugins}
    />
  </>
);
