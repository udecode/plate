import React from 'react';
import {
  createNormalizeTypesPlugin,
  createPlateUI,
  createTrailingBlockPlugin,
  Plate,
} from '@udecode/plate';
import { ELEMENT_H1 } from '@udecode/plate-heading/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { forcedLayoutValue } from './forced-layout/forcedLayoutValue';
import { trailingBlockPlugin } from './trailing-block/trailingBlockPlugin';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

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
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={forcedLayoutValue}
  />
);
