import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ACTION_ITEM,
  ActionItemPlugin,
  EditablePlugins,
  renderElementActionItem,
  withBreakEmptyReset,
  withDeleteStartReset,
} from '../../packages/slate-plugins/src';
import { initialValueActionItem } from '../config/initialValues';

export default {
  title: 'Plugins/Action Item',
  component: ActionItemPlugin,
  subcomponents: { renderElementActionItem },
};

const resetOptions = {
  types: [ACTION_ITEM],
};

export const Example = () => {
  const plugins: any[] = [];
  if (boolean('ActionItemPlugin', true)) plugins.push(ActionItemPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueActionItem);

    const editor = useMemo(
      () =>
        withBreakEmptyReset(resetOptions)(
          withDeleteStartReset(resetOptions)(
            withHistory(withReact(createEditor()))
          )
        ),
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
