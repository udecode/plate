import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  CheckListPlugin,
  EditablePlugins,
  renderElementCheckList,
  withChecklist,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueCheckLists } from '../config/initialValues';

export default {
  title: 'Plugins/CheckListPlugin',
};

export const CheckLists = () => {
  const plugins: any[] = [];
  const renderElement: any = [];
  if (boolean('CheckListPlugin', true)) plugins.push(CheckListPlugin());
  if (boolean('renderElementCheckList', false))
    renderElement.push(renderElementCheckList());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueCheckLists);

    const editor = useMemo(
      () => withChecklist(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <EditablePlugins
          plugins={plugins}
          renderElement={renderElement}
          placeholder="Get to work…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
