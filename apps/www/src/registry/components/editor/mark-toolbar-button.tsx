'use client';

import type { ScriptValue } from 'platejs';
import {
  ariaKeyShortcuts,
  type HotkeySpec,
  usesAppleDOMHotkeys,
} from 'platejs/dom';
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

const SCRIPT_SHORTCUTS = {
  sub: 'subscript',
  sup: 'superscript',
} as const;

const APPLE_MODIFIER_GLYPHS: Record<string, string> = {
  Alt: '⌥',
  Control: '⌃',
  Meta: '⌘',
  Shift: '⇧',
};

export function MarkToolbarButton(
  props: Omit<React.ComponentProps<typeof ToolbarButton>, 'value'> &
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

function useShortcutProps(
  {
    'aria-label': ariaLabel,
    tooltip,
  }: React.ComponentProps<typeof ToolbarButton>,
  keys?: HotkeySpec
) {
  const mounted = useMounted();
  if (!keys || !mounted) return {};

  const apple = usesAppleDOMHotkeys(document);
  const shortcuts = ariaKeyShortcuts(keys, {
    platform: apple ? 'apple' : 'other',
  });
  if (!shortcuts) return {};
  if (!tooltip) return { 'aria-keyshortcuts': shortcuts };

  const [combo] = shortcuts.split(' ');
  const label = apple
    ? combo
        .split('+')
        .map((key) => APPLE_MODIFIER_GLYPHS[key] ?? key)
        .join('')
    : combo.replace('Control', 'Ctrl');

  if (typeof tooltip !== 'string') {
    return {
      'aria-keyshortcuts': shortcuts,
      tooltip: (
        <>
          {tooltip} ({label})
        </>
      ),
    };
  }

  return {
    'aria-keyshortcuts': shortcuts,
    'aria-label': ariaLabel ?? tooltip,
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
  const portal = editor.plugin(plugin);
  const disabled = props.disabled || readOnly || !portal.installed;
  const shortcutName = value === undefined ? 'toggle' : SCRIPT_SHORTCUTS[value];
  const shortcutProps = useShortcutProps(
    props,
    disabled ? undefined : portal.shortcuts[shortcutName]?.keys
  );
  const pressed = useEditorSelector((innerEditor) => {
    const innerPortal = innerEditor.plugin(plugin);
    return innerPortal.installed && innerPortal.read.isActive(value);
  });

  return (
    <ToolbarButton
      {...props}
      {...shortcutProps}
      disabled={disabled}
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
