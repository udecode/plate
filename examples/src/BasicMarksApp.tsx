import React from 'react';
import { createBasicMarksPlugin, Plate, PlateProvider } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicElementsPlugins } from './basic-elements/basicElementsPlugins';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';

const plugins = createMyPlugins(
  [...basicElementsPlugins, createBasicMarksPlugin()],
  {
    components: plateUI,
  }
);

export default function BasicMarksApp() {
  return (
    <PlateProvider<MyValue> initialValue={basicMarksValue} plugins={plugins}>
      <Toolbar>
        <BasicMarkToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
