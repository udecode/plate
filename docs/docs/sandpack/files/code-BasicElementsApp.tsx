export const basicElementsAppCode = `import React from 'react';
import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createPlateUI,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { editableProps } from './common/editableProps';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { Toolbar } from './toolbar/Toolbar';
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
    <Toolbar>
      <BasicElementToolbarButtons />
    </Toolbar>

    <Plate
      editableProps={editableProps}
      initialValue={basicElementsValue}
      plugins={plugins}
    />
  </>
);
`;

export const basicElementsAppFile = {
  '/BasicElementsApp.tsx': basicElementsAppCode,
};
