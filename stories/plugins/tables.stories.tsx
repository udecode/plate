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
  HeadingToolbar,
  insertTable,
  MARK_BOLD,
  renderElementTable,
  TablePlugin,
  ToolbarMark,
  ToolbarTable,
  withTable,
} from '../../packages/slate-plugins/src';
import { initialValueTables, nodeTypes } from '../config/initialValues';

export default {
  title: 'Plugins/Table',
  component: TablePlugin,
  subcomponents: { renderElementTable },
};

export const Example = () => {
  const plugins = [BoldPlugin()];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueTables);

    const editor = useMemo(
      () => withTable(nodeTypes)(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarTable
            {...nodeTypes}
            action={insertTable}
            icon={<BorderAll />}
          />
          <ToolbarTable
            {...nodeTypes}
            action={deleteTable}
            icon={<BorderClear />}
          />
          <ToolbarTable
            {...nodeTypes}
            action={addRow}
            icon={<BorderBottom />}
          />
          <ToolbarTable
            {...nodeTypes}
            action={deleteRow}
            icon={<BorderTop />}
          />
          <ToolbarTable
            {...nodeTypes}
            action={addColumn}
            icon={<BorderLeft />}
          />
          <ToolbarTable
            {...nodeTypes}
            action={deleteColumn}
            icon={<BorderRight />}
          />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
