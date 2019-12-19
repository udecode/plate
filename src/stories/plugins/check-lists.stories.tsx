import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  CheckListPlugin,
  EditablePlugins,
  renderElementCheckList,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueCheckLists } from '../config/initialValues';

export default {
  title: 'Plugins/CheckListPlugin',
};

export const CheckLists = () => {
  const plugins = [];
  const renderElement = [];
  if (boolean('CheckListPlugin', true)) plugins.push(CheckListPlugin());
  if (boolean('renderElementCheckList', false))
    renderElement.push(renderElementCheckList());

  const [value, setValue] = useState(initialValueCheckLists);

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
        placeholder="Get to work…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
