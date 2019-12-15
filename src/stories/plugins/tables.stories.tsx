import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  renderElementTable,
  renderLeafTable,
  TablePlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueTables } from '../config/initialValues';

export default {
  title: 'Plugins|TablePlugin',
};

export const Tables = () => {
  const plugins = [];
  const renderElement = [];
  const renderLeaf = [];
  if (boolean('TablePlugin', true, 'plugins')) plugins.push(TablePlugin());
  else {
    if (boolean('renderElementTable', false, 'renderElement'))
      renderElement.push(renderElementTable);
    if (boolean('renderLeafTable', false, 'renderLeaf'))
      renderLeaf.push(renderLeafTable);
  }

  const [value, setValue] = useState(initialValueTables);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};
