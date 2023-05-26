import React from 'react';
import {
  createListPlugin,
  createTabbablePlugin,
  ELEMENT_CODE_BLOCK,
  ELEMENT_LI,
  findNode,
  Plate,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { createTabbableElementPlugin } from '@/plate/tabbable/createTabbableElementPlugin';
import { TabbableElement } from '@/plate/tabbable/TabbableElement';
import { tabbableValue } from '@/plate/tabbable/tabbableValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
    }) as any,
  ],
  {
    components: plateUI,
  }
);

export default function TabbableApp() {
  return (
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
}
