'use client';

import * as React from 'react';

import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';

import { type PlateEditor, useEditor, useEditorSelector } from 'platejs/react';

import { ToolbarButton } from './toolbar';

type ToolbarButtonProps = React.ComponentProps<typeof ToolbarButton>;

type MarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof KbdPlugin
  | typeof StrikethroughPlugin
  | typeof SubscriptPlugin
  | typeof SuperscriptPlugin
  | typeof UnderlinePlugin;

type MarkToolbarButtonProps = ToolbarButtonProps & {
  plugin: MarkPlugin;
};

function toggleMark(editor: PlateEditor, plugin: MarkPlugin) {
  switch (plugin.key) {
    case BoldPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case CodePlugin.key:
      return editor.plugin(plugin).update.toggle();
    case HighlightPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case ItalicPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case KbdPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case StrikethroughPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case SubscriptPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case SuperscriptPlugin.key:
      return editor.plugin(plugin).update.toggle();
    case UnderlinePlugin.key:
      return editor.plugin(plugin).update.toggle();
  }
}

export function MarkToolbarButton({
  plugin,
  ...props
}: MarkToolbarButtonProps) {
  const editor = useEditor();
  const { type } = editor.plugin(plugin);
  const pressed = useEditorSelector((editor) => !!editor.read.marks()?.[type]);

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        toggleMark(editor, plugin);
        editor.api.dom.focus();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    />
  );
}
