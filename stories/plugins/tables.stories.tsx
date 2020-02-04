import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';

import {
  BorderAll,
  BorderClear,
  BorderBottom,
  BorderTop,
  BorderLeft,
  BorderRight,
  FormatBold
} from '@material-ui/icons';

import {
  BoldPlugin,
  EditablePlugins,
  renderElementTable,
  TablePlugin,
  HeadingToolbar,
  withTable,
  ToolbarMark,
  ToolbarTable,
  MARK_BOLD,
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  insertTable,
  deleteTable,
} from '../../packages/slate-plugins/src';
import { initialValueTables } from '../config/initialValues';

export default {
  title: 'Plugins/Table',
  component: TablePlugin,
  subcomponents: { renderElementTable },
};

export const Example = () => {
  const plugins = [BoldPlugin()];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueTables);

    const editor = useMemo(
      () => withTable(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarMark format={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarTable action={insertTable} icon={<BorderAll />} />
          <ToolbarTable action={deleteTable} icon={<BorderClear />} />
          <ToolbarTable action={addRow} icon={<BorderBottom />} />
          <ToolbarTable action={deleteRow} icon={<BorderTop />} />
          <ToolbarTable action={addColumn} icon={<BorderLeft />} />
          <ToolbarTable action={deleteColumn} icon={<BorderRight />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
