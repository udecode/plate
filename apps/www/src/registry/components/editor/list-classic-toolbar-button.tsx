'use client';

import { ListPlugin } from '@platejs/list-classic/react';
import {
  IndentIcon,
  List,
  ListOrdered,
  ListTodo,
  OutdentIcon,
} from 'lucide-react';
import { PLUGINS, type PluginReference } from 'platejs';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

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
  const editor = useEditor();
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.read.selection() &&
      editor.read.nodes.some({
        type:
          typeof plugin === 'string'
            ? editor.plugin(plugin).schema.type
            : plugin,
      })
  );
  const name = typeof plugin === 'string' ? plugin : plugin.name;
  const { icon, label } = pluginMap[name] ?? pluginMap[PLUGINS.bulletedList];

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        editor.plugin(ListPlugin).update.toggle({
          type: editor.plugin(plugin).schema.type,
        });
        editor.api.dom.focus();
      }}
      onMouseDown={(event) => event.preventDefault()}
      tooltip={label}
    >
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
