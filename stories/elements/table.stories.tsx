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
  insertTable,
  MARK_BOLD,
  ParagraphPlugin,
  SlatePlugins,
  SoftBreakPlugin,
  TablePlugin,
  withTable,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarMark,
  ToolbarTable,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  initialValueTables,
  options,
  optionsExitBreak,
  optionsSoftBreak,
} from '../config/initialValues';

const id = 'Elements/Table';

export default {
  title: id,
  component: TablePlugin,
};

const withPlugins = [withReact, withHistory, withTable(options)] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(),
    HeadingPlugin(),
    BoldPlugin(),
    SoftBreakPlugin(optionsSoftBreak),
    ExitBreakPlugin(optionsExitBreak),
  ];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());

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
        <EditablePlugins plugins={plugins} />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
