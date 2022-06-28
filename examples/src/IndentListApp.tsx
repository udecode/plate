import React from 'react';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import {
  createHeadingPlugin,
  createIndentPlugin,
  createParagraphPlugin,
  createPlateUI,
  HeadingToolbar,
  Plate,
  StyledElement,
  withPlateEventProvider,
} from '@udecode/plate';
import { withProps } from '@udecode/plate-core/src/index';
import { ELEMENT_H1 } from '@udecode/plate-heading/src/index';
import {
  createIndentListPlugin,
  toggleIndentList,
} from '@udecode/plate-indent-list/src/index';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/index';
import { ToolbarButton } from '@udecode/plate-ui-toolbar/src/index';
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
