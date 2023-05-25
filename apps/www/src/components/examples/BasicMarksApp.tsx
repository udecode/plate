import React from 'react';
import { createBasicMarksPlugin, Plate, PlateProvider } from '@udecode/plate';

import { Toolbar } from '@/components/ui/toolbar';
import { basicElementsPlugins } from '@/plate/basic-elements/basicElementsPlugins';
import { basicMarksValue } from '@/plate/basic-marks/basicMarksValue';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicElementsPlugins, createBasicMarksPlugin()],
  {
    components: plateUI,
  }
);

export default function BasicMarksApp() {
  return (
    <PlateProvider<MyValue> initialValue={basicMarksValue} plugins={plugins}>
      <Toolbar>{/* <BasicMarkToolbarButtons /> */}</Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
