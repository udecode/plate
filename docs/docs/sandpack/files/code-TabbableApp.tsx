export const tabbableAppCode = `import React from 'react';
import {
  createListPlugin,
  createTabbablePlugin,
  ELEMENT_CODE_BLOCK,
  ELEMENT_LI,
  findNode,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createTabbableElementPlugin } from './tabbable/createTabbableElementPlugin';
import { TabbableElement } from './tabbable/TabbableElement';
import { tabbableValue } from './tabbable/tabbableValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createTabbablePlugin({
      options: {
        query: (editor) => {
          const inList = findNode(editor, { match: { type: ELEMENT_LI } });
          const inCodeBlock = findNode(editor, {
            match: { type: ELEMENT_CODE_BLOCK },
          });
          return !inList && !inCodeBlock;
        },
      },
    }),
    createTabbableElementPlugin({
      component: TabbableElement,
    }),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <button type="button">Button before editor</button>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={tabbableValue}
    />
    <button type="button">Button after editor</button>
  </>
);
`;

export const tabbableAppFile = {
  '/TabbableApp.tsx': tabbableAppCode,
};
