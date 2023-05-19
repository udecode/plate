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
  ToolbarButton,
  withProps,
} from '@udecode/plate';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { indentListPlugin } from './indent-list/indentListPlugin';
import { indentListValue } from './indent-list/indentListValue';
import { Toolbar } from './toolbar/Toolbar';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from './typescript/plateTypes';

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
      <Toolbar>
        <ToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
