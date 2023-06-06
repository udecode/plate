'use client';

import React from 'react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { Plate, PlateProvider } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { AlignDropdownMenu } from '@/components/plate-ui/align-dropdown-menu';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { alignValue } from '@/plate/demo/values/alignValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
      <FixedToolbar>
        <AlignDropdownMenu />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
