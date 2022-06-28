export const indentListAppCode = `import React from 'react';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import {
  createHeadingPlugin,
  createIndentListPlugin,
  createIndentPlugin,
  createParagraphPlugin,
  createPlateUI,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  HeadingToolbar,
  Plate,
  StyledElement,
  toggleIndentList,
  ToolbarButton,
  withPlateEventProvider,
  withProps,
} from '@udecode/plate';
import { editableProps } from './common/editableProps';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { indentListPlugin } from './indent-list/indentListPlugin';
import { indentListValue } from './indent-list/indentListValue';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    createHeadingPlugin(),
    createParagraphPlugin({
      component: withProps(StyledElement, {
        as: 'div',
        styles: {
          root: {
            margin: 0,
            padding: '4px 0',
          },
        },
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
  ],
  {
    components: createPlateUI(),
  }
);

const Toolbar = withPlateEventProvider(() => {
  const editor = useMyPlateEditorRef()!;

  return (
    <HeadingToolbar>
      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault();
          toggleIndentList(editor, {
            listStyleType: 'disc',
          });
        }}
        icon={<FormatListBulleted />}
      />
      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault();
          toggleIndentList(editor, {
            listStyleType: 'decimal',
          });
        }}
        icon={<FormatListNumbered />}
      />
      <IndentToolbarButtons />
    </HeadingToolbar>
  );
});

export default () => (
  <>
    <Toolbar />

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={indentListValue}
      normalizeInitialValue
    />
  </>
);
`;

export const indentListAppFile = {
  '/IndentListApp.tsx': indentListAppCode,
};
