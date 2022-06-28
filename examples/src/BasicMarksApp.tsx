import 'tippy.js/dist/tippy.css';
import React from 'react';
import { createPlateUI, HeadingToolbar, Plate } from '@udecode/plate';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks/src/index';
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
