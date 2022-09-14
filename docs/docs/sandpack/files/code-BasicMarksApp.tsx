export const basicMarksAppCode = `import React from 'react';
import { createBasicMarksPlugin, Plate, PlateProvider } from '@udecode/plate';
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
  <PlateProvider<MyValue> initialValue={basicMarksValue} plugins={plugins}>
    <Toolbar>
      <BasicMarkToolbarButtons />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
`;

export const basicMarksAppFile = {
  '/BasicMarksApp.tsx': basicMarksAppCode,
};
