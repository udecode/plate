'use client';

import type { ScriptValue } from 'platejs';
import {
  type BoldPlugin,
  type CodePlugin,
  type HighlightPlugin,
  type ItalicPlugin,
  type KbdPlugin,
  type ScriptPlugin,
  type StrikethroughPlugin,
  type UnderlinePlugin,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

type BooleanMarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof KbdPlugin
  | typeof StrikethroughPlugin
  | typeof UnderlinePlugin;

export function MarkToolbarButton({
  plugin,
  value,
  ...props
}: React.ComponentProps<typeof ToolbarButton> &
  (
    | {
        plugin: BooleanMarkPlugin;
        value?: never;
      }
    | {
        plugin: typeof ScriptPlugin;
        value: ScriptValue;
      }
  )) {
  const editor = useEditor();
  const pressed = useEditorSelector((innerEditor) =>
    innerEditor.plugin(plugin).read.isActive(value)
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
    />
  );
}
