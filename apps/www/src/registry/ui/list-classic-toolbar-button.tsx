'use client';

import * as React from 'react';

import {
  ListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@platejs/list-classic/react';
import {
  IndentIcon,
  List,
  ListOrdered,
  ListTodo,
  OutdentIcon,
} from 'lucide-react';
import { PLUGINS, type PluginReference } from 'platejs';
import { useEditor } from 'platejs/react';

import { ToolbarButton } from './toolbar';

const pluginMap: Record<string, { icon: React.JSX.Element; label: string }> = {
  [PLUGINS.numberedList]: {
    icon: <ListOrdered />,
    label: 'Numbered List',
  },
  [PLUGINS.taskList]: { icon: <ListTodo />, label: 'Task List' },
  [PLUGINS.bulletedList]: { icon: <List />, label: 'Bulleted List' },
};

export function ListToolbarButton({
  plugin = PLUGINS.bulletedList,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  plugin?: PluginReference | string;
}) {
  const state = useListToolbarButtonState({ plugin });
  const { props: buttonProps } = useListToolbarButton(state);
  const name = typeof plugin === 'string' ? plugin : plugin.name;
  const { icon, label } = pluginMap[name] ?? pluginMap[PLUGINS.bulletedList];

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip={label}>
      {icon}
    </ToolbarButton>
  );
}

export function IndentToolbarButton({
  reverse = false,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  reverse?: boolean;
}) {
  const editor = useEditor();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        const list = editor.plugin(ListPlugin);

        if (reverse) {
          list.update.outdent();
        } else {
          list.update.indent();
        }
      }}
      tooltip={reverse ? 'Outdent' : 'Indent'}
    >
      {reverse ? <OutdentIcon /> : <IndentIcon />}
    </ToolbarButton>
  );
}
