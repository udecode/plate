import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  EditablePlugins,
  ParagraphPlugin,
  pipe,
  renderElementActionItem,
  withBreakEmptyReset,
  withDeleteStartReset,
} from '../../../packages/slate-plugins/src';
import { initialValueActionItem, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Block/Action Item',
  component: ActionItemPlugin,
  subcomponents: { renderElementActionItem },
};

const resetOptions = {
  ...nodeTypes,
  types: [nodeTypes.typeActionItem],
};

const withPlugins = [
  withReact,
  withHistory,
  withDeleteStartReset(resetOptions),
  withBreakEmptyReset(resetOptions),
] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('ActionItemPlugin', true))
    plugins.push(ActionItemPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueActionItem);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
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
