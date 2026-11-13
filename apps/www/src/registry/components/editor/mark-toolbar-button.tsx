'use client';

import { IS_APPLE, type ScriptValue } from 'platejs';
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
import { useMounted } from '@/registry/hooks/use-mounted';

type BooleanMarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof KbdPlugin
  | typeof StrikethroughPlugin
  | typeof UnderlinePlugin;

const APPLE_KEY_GLYPHS: Record<string, string> = {
  Alt: '⌥',
  Meta: '⌘',
  Shift: '⇧',
};

export function MarkToolbarButton({
  shortcut,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  /** `mod`, `shift` or `alt` joined to one key with `+`, such as `mod+shift+x`. */
  shortcut?: string;
} & (
    | {
        plugin: BooleanMarkPlugin;
        value?: never;
      }
    | {
        plugin: typeof ScriptPlugin;
        value: ScriptValue;
      }
  )) {
  const editor = useOptionalEditor();
  const shortcutProps = useShortcutProps(props.tooltip, shortcut);
  if (!editor) {
    const { plugin, value, ...buttonProps } = props;
    return <ToolbarButton {...buttonProps} {...shortcutProps} disabled />;
  }
  return <MountedMarkToolbarButton {...props} {...shortcutProps} />;
}

// The platform is known only on the client, so the server and the first client
// render leave the shortcut out and the label appears after mount.
function useShortcutProps(tooltip: React.ReactNode, shortcut?: string) {
  const mounted = useMounted();
  if (!shortcut || !mounted || typeof tooltip !== 'string') return {};

  const keys = shortcut.split('+').map((key) => {
    if (key === 'mod') return IS_APPLE ? 'Meta' : 'Control';
    return key[0].toUpperCase() + key.slice(1);
  });
  const label = keys
    .map((key) =>
      IS_APPLE ? (APPLE_KEY_GLYPHS[key] ?? key) : key.replace('Control', 'Ctrl')
    )
    .join('+');

  return {
    'aria-keyshortcuts': keys.join('+'),
    'aria-label': tooltip,
    tooltip: `${tooltip} (${label})`,
  };
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
