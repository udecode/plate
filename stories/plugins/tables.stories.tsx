import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';

import { BorderAll, FormatBold } from '@material-ui/icons';

import {
  BoldPlugin,
  EditablePlugins,
  renderElementTable,
  TablePlugin,
  HeadingToolbar,
  withTable,
  ToolbarMark,
  ToolbarInsertTable,
  MARK_BOLD, TableType,
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
          <ToolbarInsertTable format={TableType.TABLE} icon={<BorderAll />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
