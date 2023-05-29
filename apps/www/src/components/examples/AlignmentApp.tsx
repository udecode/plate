'use client';

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

import { AlignDropdownMenu } from '@/plate/aui/align-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { alignValue } from '@/plate/demo/values/alignValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

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
      <HeadingToolbar>
        <AlignDropdownMenu />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
