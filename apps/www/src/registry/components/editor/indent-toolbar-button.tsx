'use client';

import { IndentIcon, OutdentIcon } from 'lucide-react';
import { IndentPlugin, useEditor, useEditorReadOnly } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function IndentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <ToolbarButton
      {...props}
      disabled={props.disabled || readOnly}
      tooltip="Indent"
      onClick={() => {
        editor.plugin(IndentPlugin).update.increase();
        editor.api.dom.focus();
      }}
    >
      <IndentIcon className="[&:dir(rtl)]:-scale-x-100" />
    </ToolbarButton>
  );
}

export function OutdentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <ToolbarButton
      {...props}
      disabled={props.disabled || readOnly}
      tooltip="Outdent"
      onClick={() => {
        editor.plugin(IndentPlugin).update.decrease();
        editor.api.dom.focus();
      }}
    >
      <OutdentIcon className="[&:dir(rtl)]:-scale-x-100" />
    </ToolbarButton>
  );
}
