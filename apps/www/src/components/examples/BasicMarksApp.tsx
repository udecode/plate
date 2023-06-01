import React from 'react';
import { createBasicMarksPlugin, Plate, PlateProvider } from '@udecode/plate';

import { Toolbar } from '@/components/ui/toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicElementsPlugins } from '@/plate/demo/plugins/basicElementsPlugins';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

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
