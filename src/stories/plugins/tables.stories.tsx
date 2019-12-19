import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  renderElementTable,
  TablePlugin,
  withTable,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueTables } from '../config/initialValues';

export default {
  title: 'Plugins/TablePlugin',
  component: TablePlugin,
};

export const Tables = () => {
  const plugins = [BoldPlugin()];
  const renderElement: any = [];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('renderElementTable', false))
    renderElement.push(renderElementTable);

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
        <EditablePlugins plugins={plugins} renderElement={renderElement} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
