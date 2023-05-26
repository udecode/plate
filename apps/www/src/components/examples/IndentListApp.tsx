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
  PlateProvider,
  toggleIndentList,
  withProps,
} from '@udecode/plate';
import { PlateElement } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { indentListPlugin } from '@/plate/demo/plugins/indentListPlugin';
import { indentListValue } from '@/plate/demo/values/indentListValue';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

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
      <IndentToolbarButtons />
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
      <HeadingToolbar>
        <ToolbarButtons />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
