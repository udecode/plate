'use client';

import type { ScriptValue } from '@platejs/basic-nodes';
import type {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

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
        value: ScriptValue;
      }
  );

export function MarkToolbarButton({
  plugin,
  value,
  ...props
}: MarkToolbarButtonProps) {
  const editor = useEditor();
  const pressed = useEditorSelector((editor) =>
    editor.plugin(plugin).read.isActive(value)
  );

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        if (value === undefined) {
          editor.plugin(plugin).update.toggle();
        } else {
          editor.plugin(plugin).update.toggle(value);
        }

        editor.api.dom.focus();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    />
  );
}
