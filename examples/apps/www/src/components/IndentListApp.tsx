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

import { editableProps } from '@/plate/common/editableProps';
import { Icons } from '@/plate/common/icons';
import { plateUI } from '@/plate/common/plateUI';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { indentListPlugin } from '@/plate/indent-list/indentListPlugin';
import { indentListValue } from '@/plate/indent-list/indentListValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { ToolbarButton } from '@/plate/toolbar/ToolbarButton';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from '@/plate/typescript/plateTypes';

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
        icon={<Icons.ul />}
      />
      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault();
          toggleIndentList(editor, {
            listStyleType: 'decimal',
          });
        }}
        icon={<Icons.ol />}
      />
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
