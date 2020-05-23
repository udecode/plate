import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { FormatListBulleted, FormatListNumbered } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  ActionItemPlugin,
  EditablePlugins,
  HeadingToolbar,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  ToolbarList,
  withBreakEmptyReset,
  withDeleteStartReset,
  withList,
  withToggleType,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import { initialValueList, nodeTypes } from '../config/initialValues';

export default {
  title: 'Elements/List',
  component: ListPlugin,
  subcomponents: {
    ActionItemPlugin,
  },
};

const resetOptions = {
  ...nodeTypes,
  types: [nodeTypes.typeActionItem],
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType(nodeTypes),
  withDeleteStartReset(resetOptions),
  withBreakEmptyReset(resetOptions),
  withList(nodeTypes),
] as const;

export const Example = () => {
  const plugins: any[] = [];
  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('ActionItemPlugin', true))
    plugins.push(ActionItemPlugin(nodeTypes));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueList);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeUl}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeOl}
            icon={<FormatListNumbered />}
          />
        </HeadingToolbar>
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
