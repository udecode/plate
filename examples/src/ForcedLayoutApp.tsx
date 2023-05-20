import React from 'react';
import {
  createNormalizeTypesPlugin,
  createTrailingBlockPlugin,
  ELEMENT_H1,
  Plate,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { forcedLayoutValue } from './forced-layout/forcedLayoutValue';
import { trailingBlockPlugin } from './trailing-block/trailingBlockPlugin';

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
