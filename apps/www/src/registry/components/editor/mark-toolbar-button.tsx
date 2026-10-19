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
  useEditorReadOnly,
  useOptionalEditor,
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

export function MarkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton> &
    (
      | {
          plugin: BooleanMarkPlugin;
          value?: never;
        }
      | {
          plugin: typeof ScriptPlugin;
          value: ScriptValue;
        }
    )
) {
  const editor = useOptionalEditor();
  if (!editor) {
    const { plugin, value, ...buttonProps } = props;
    return <ToolbarButton {...buttonProps} disabled />;
  }
  return <MountedMarkToolbarButton {...props} />;
}

function MountedMarkToolbarButton({
  plugin,
  value,
  ...props
}: React.ComponentProps<typeof MarkToolbarButton>) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const { installed } = editor.plugin(plugin);
  const pressed = useEditorSelector((innerEditor) => {
    const portal = innerEditor.plugin(plugin);
    return portal.installed && portal.read.isActive(value);
  });

  return (
    <ToolbarButton
      {...props}
      disabled={props.disabled || readOnly || !installed}
      pressed={pressed}
      onClick={() => {
        if (editor.read.view.isReadOnly() || !editor.plugin(plugin).installed) {
          return;
        }
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
