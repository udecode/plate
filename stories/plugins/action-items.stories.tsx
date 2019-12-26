import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  EditablePlugins,
  renderElementActionItem,
  withActionItem,
} from '../../packages/slate-plugins/src';
import { initialValueActionItem } from '../config/initialValues';

export default {
  title: 'Plugins/ActionItemPlugin',
  component: ActionItemPlugin,
  subcomponents: { renderElementActionItem },
};

export const ActionItems = () => {
  const plugins: any[] = [];
  if (boolean('ActionItemPlugin', true)) plugins.push(ActionItemPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueActionItem);

    const editor = useMemo(
      () => withActionItem(withHistory(withReact(createEditor()))),
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
