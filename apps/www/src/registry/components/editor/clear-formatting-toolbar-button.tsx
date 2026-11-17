'use client';

import { RemoveFormattingIcon } from 'lucide-react';
import { FormattingPlugin, useEditor, useEditorReadOnly } from 'platejs/react';
import * as React from 'react';

import { useShortcutProps } from '@/registry/components/editor/mark-toolbar-button';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function ClearFormattingToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const formatting = editor.plugin(FormattingPlugin);
  const disabled = props.disabled || readOnly || !formatting.installed;
  const tooltipProps = { tooltip: 'Clear formatting', ...props };
  const shortcutProps = useShortcutProps(
    tooltipProps,
    disabled ? undefined : formatting.shortcuts.clear?.keys
  );

  return (
    <ToolbarButton
      {...tooltipProps}
      {...shortcutProps}
      disabled={disabled}
      onClick={() => {
        formatting.update.clear();
        editor.api.dom.focus();
      }}
    >
      <RemoveFormattingIcon />
    </ToolbarButton>
  );
}
