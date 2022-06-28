import React from 'react';
import {
  createBasicMarksPlugin,
  createPlateUI,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { basicElementsPlugins } from './basic-elements/basicElementsPlugins';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { editableProps } from './common/editableProps';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicElementsPlugins, createBasicMarksPlugin()],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <BasicMarkToolbarButtons />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={basicMarksValue}
      plugins={plugins}
    />
  </>
);
