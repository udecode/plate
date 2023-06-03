import React from 'react';
import {
  createHeadingPlugin,
  createIndentListPlugin,
  createIndentPlugin,
  createParagraphPlugin,
  createResetNodePlugin,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  Plate,
  PlateElement,
  PlateProvider,
  toggleIndentList,
  withProps,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { FixedToolbar } from '@/plate/aui/fixed-toolbar';
import { OutdentToolbarButton } from '@/plate/aui/outdent-toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { indentListPlugin } from '@/plate/demo/plugins/indentListPlugin';
import { indentListValue } from '@/plate/demo/values/indentListValue';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from '@/types/plate.types';

const plugins = createMyPlugins(
  [
    createHeadingPlugin(),
    createParagraphPlugin({
      component: withProps(PlateElement, {
        as: 'div',
        className: 'm-0 py-1 px-0',
      }),
    }),
    createIndentListPlugin(indentListPlugin),
    createIndentPlugin({
      inject: {
        props: {
          validTypes: [ELEMENT_PARAGRAPH, ELEMENT_H1],
        },
      },
    }),
    createResetNodePlugin(),
  ],
  {
    components: plateUI,
  }
);

function ToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault();
          toggleIndentList(editor, {
            listStyleType: 'disc',
          });
        }}
      >
        <Icons.ul />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault();
          toggleIndentList(editor, {
            listStyleType: 'decimal',
          });
        }}
      >
        <Icons.ol />
      </ToolbarButton>
      <OutdentToolbarButton />
    </>
  );
}

export default function IndentListApp() {
  return (
    <PlateProvider<MyValue>
      plugins={plugins}
      initialValue={indentListValue}
      normalizeInitialValue
    >
      <FixedToolbar>
        <ToolbarButtons />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
