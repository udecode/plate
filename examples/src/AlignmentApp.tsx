import React from 'react';
import {
  createAlignPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { AlignToolbarButtons } from './align/AlignToolbarButtons';
import { alignValue } from './align/alignValue';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createAlignPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
          ],
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function AlignmentApp() {
  return (
    <PlateProvider<MyValue> initialValue={alignValue} plugins={plugins}>
      <Toolbar>
        <AlignToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
