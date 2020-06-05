import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  BorderAll,
  BorderBottom,
  BorderClear,
  BorderLeft,
  BorderRight,
  BorderTop,
  FormatBold,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  addColumn,
  addRow,
  BoldPlugin,
  deleteColumn,
  deleteRow,
  deleteTable,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
  insertTable,
  MARK_BOLD,
  ParagraphPlugin,
  pipe,
  renderElementTable,
  SlateDocument,
  SoftBreakPlugin,
  TablePlugin,
  ToolbarMark,
  ToolbarTable,
  withTable,
} from '../../packages/slate-plugins/src';
import {
  headingTypes,
  initialValueTables,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Elements/Table',
  component: TablePlugin,
  subcomponents: { renderElementTable },
};

const withPlugins = [withReact, withHistory, withTable(nodeTypes)] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    BoldPlugin(nodeTypes),
    SoftBreakPlugin({
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              nodeTypes.typeCodeBlock,
              nodeTypes.typeBlockquote,
              nodeTypes.typeTd,
            ],
          },
        },
      ],
    }),
    ExitBreakPlugin({
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: headingTypes,
          },
        },
      ],
    }),
  ];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueTables);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <HeadingToolbar>
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderAll />}
            transform={insertTable}
          />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderClear />}
            transform={deleteTable}
          />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderBottom />}
            transform={addRow}
          />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderTop />}
            transform={deleteRow}
          />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderLeft />}
            transform={addColumn}
          />
          <ToolbarTable
            {...nodeTypes}
            icon={<BorderRight />}
            transform={deleteColumn}
          />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
