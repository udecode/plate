'use client';

import { Link } from 'lucide-react';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

import { linkPlugin } from './link';

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const portal = editor.plugin(linkPlugin);
  // A bare LinkPlugin has no link form to open.
  const canTrigger = portal.installed && 'trigger' in portal.api;
  const pressed = useEditorSelector(
    (innerEditor) =>
      canTrigger &&
      !!innerEditor.read.selection() &&
      innerEditor.read.nodes.some({ type: linkPlugin })
  );

  if (!canTrigger) return null;

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        const current = editor.plugin(linkPlugin);

        if (!current.installed || !('trigger' in current.api)) return;
        if (!editor.read.view.isFocused()) editor.api.dom.focus();
        current.api.trigger({ focused: true });
      }}
      data-editor-keep-selection-visible
      tooltip="Link"
    >
      <Link />
    </ToolbarButton>
  );
}
