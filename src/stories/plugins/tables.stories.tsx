import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  renderElementTable,
  TablePlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueTables } from '../config/initialValues';

export default {
  title: 'Plugins/TablePlugin',
  component: TablePlugin,
};

export const Tables = () => {
  const plugins = [BoldPlugin()];
  const renderElement = [];
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('renderElementTable', false))
    renderElement.push(renderElementTable);

  const [value, setValue] = useState(initialValueTables);

  const editor = useCreateEditor([withReact, withHistory], plugins);

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
