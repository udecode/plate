import React from 'react';
import {
  createNormalizeTypesPlugin,
  createTrailingBlockPlugin,
  ELEMENT_H1,
  Plate,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { forcedLayoutValue } from '@/plate/forced-layout/forcedLayoutValue';
import { trailingBlockPlugin } from '@/plate/trailing-block/trailingBlockPlugin';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createTrailingBlockPlugin(trailingBlockPlugin),
    createNormalizeTypesPlugin({
      options: {
        rules: [{ path: [0], strictType: ELEMENT_H1 }],
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function ForcedLayoutApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={forcedLayoutValue}
    />
  );
}
