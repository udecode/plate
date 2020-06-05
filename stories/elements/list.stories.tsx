import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { FormatListBulleted, FormatListNumbered } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  ToolbarList,
  withList,
  withResetBlockType,
  withToggleType,
} from '../../packages/slate-plugins/src';
import { initialValueList, nodeTypes } from '../config/initialValues';

export default {
  title: 'Elements/List',
  component: ListPlugin,
  subcomponents: {
    ActionItemPlugin,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [nodeTypes.typeActionItem],
    defaultType: nodeTypes.typeP,
  }),
  withList(nodeTypes),
] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];
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
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
