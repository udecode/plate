import React from 'react';
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
  renderElementTable,
  SlatePlugins,
  SoftBreakPlugin,
  TablePlugin,
  ToolbarMark,
  ToolbarTable,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  headingTypes,
  initialValueTables,
  options,
} from '../config/initialValues';

const id = 'Elements/Table';

export default {
  title: id,
  component: TablePlugin,
  subcomponents: { renderElementTable },
};

const withPlugins = [withReact, withHistory, withTable(options)] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    BoldPlugin(options),
    SoftBreakPlugin({
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              options.code_block.type,
              options.blockquote.type,
              options.td.type,
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
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(options));

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueTables}
        withPlugins={withPlugins}
      >
        <HeadingToolbar>
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarTable
            {...options}
            icon={<BorderAll />}
            transform={insertTable}
          />
          <ToolbarTable
            {...options}
            icon={<BorderClear />}
            transform={deleteTable}
          />
          <ToolbarTable
            {...options}
            icon={<BorderBottom />}
            transform={addRow}
          />
          <ToolbarTable
            {...options}
            icon={<BorderTop />}
            transform={deleteRow}
          />
          <ToolbarTable
            {...options}
            icon={<BorderLeft />}
            transform={addColumn}
          />
          <ToolbarTable
            {...options}
            icon={<BorderRight />}
            transform={deleteColumn}
          />
        </HeadingToolbar>
        <EditablePlugins id={id} plugins={plugins} />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
