export const basicMarksAppCode = `import React from 'react';
import { createBasicMarksPlugin, Plate } from '@udecode/plate';
import { basicElementsPlugins } from './basic-elements/basicElementsPlugins';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicElementsPlugins, createBasicMarksPlugin()],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <Toolbar>
      <BasicMarkToolbarButtons />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={basicMarksValue}
      plugins={plugins}
    />
  </>
);
`;

export const basicMarksAppFile = {
  '/BasicMarksApp.tsx': basicMarksAppCode,
};
