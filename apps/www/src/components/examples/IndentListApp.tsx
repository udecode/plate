import React from 'react';
import {
  Plate,
  PlateElement,
  PlateProvider,
  withProps,
} from '@udecode/plate-common';
import { createHeadingPlugin, ELEMENT_H1 } from '@udecode/plate-heading';
import { createIndentPlugin } from '@udecode/plate-indent';
import {
  createIndentListPlugin,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';

import { Icons } from '@/components/icons';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { OutdentToolbarButton } from '@/components/plate-ui/outdent-toolbar-button';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { indentListPlugin } from '@/plate/demo/plugins/indentListPlugin';
import { indentListValue } from '@/plate/demo/values/indentListValue';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from '@/plate/plate.types';

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
