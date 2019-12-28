import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  renderElementTable,
  TablePlugin,
  withTable,
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
        <EditablePlugins plugins={plugins} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
