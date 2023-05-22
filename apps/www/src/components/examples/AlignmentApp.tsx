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

import { AlignToolbarButtons } from '@/plate/align/AlignToolbarButtons';
import { alignValue } from '@/plate/align/alignValue';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
        <AlignToolbarButtons />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
