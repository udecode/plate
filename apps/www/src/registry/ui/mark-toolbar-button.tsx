'use client';

import * as React from 'react';

import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import type { TScriptValue } from '@platejs/utils';

import { type PlateEditor, useEditor, useEditorSelector } from 'platejs/react';

import { ToolbarButton } from './toolbar';

type ToolbarButtonProps = React.ComponentProps<typeof ToolbarButton>;

type BooleanMarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof KbdPlugin
  | typeof StrikethroughPlugin
  | typeof UnderlinePlugin;

type MarkToolbarButtonProps = ToolbarButtonProps &
  (
    | {
        plugin: BooleanMarkPlugin;
        value?: never;
      }
    | {
        plugin: typeof ScriptPlugin;
        value: TScriptValue;
      }
  );

function toggleMark(
  editor: PlateEditor,
  plugin: BooleanMarkPlugin | typeof ScriptPlugin,
  value?: TScriptValue
) {
  switch (plugin.name) {
    case BoldPlugin.name:
      return editor.plugin(plugin).update.toggle();
    case CodePlugin.name:
      return editor.plugin(plugin).update.toggle();
    case HighlightPlugin.name:
      return editor.plugin(plugin).update.toggle();
    case ItalicPlugin.name:
      return editor.plugin(plugin).update.toggle();
    case KbdPlugin.name:
      return editor.plugin(plugin).update.toggle();
    case StrikethroughPlugin.name:
      return editor.plugin(plugin).update.toggle();
    case ScriptPlugin.name: {
      if (value === undefined) return;

      return editor.plugin(ScriptPlugin).update.toggle(value);
    }
    case UnderlinePlugin.name:
      return editor.plugin(plugin).update.toggle();
  }
}

export function MarkToolbarButton({
  plugin,
  value,
  ...props
}: MarkToolbarButtonProps) {
  const editor = useEditor();
  const { type } = editor.plugin(plugin);
  const pressed = useEditorSelector((editor) => {
    const mark = editor.read.marks()?.[type];

    return value === undefined ? !!mark : mark === value;
  });

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        toggleMark(editor, plugin, value);
        editor.api.dom.focus();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    />
  );
}
