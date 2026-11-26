'use client';

import { EyeOffIcon } from 'lucide-react';
import { InkPlugin } from 'platejs/ink/react';
import { useEditor, useViewStore } from 'platejs/react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function InkSwitchToolbarButton() {
  const editor = useEditor();
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);

  return (
    <ToolbarButton
      onClick={() => editor.plugin(InkPlugin).api.setHidden(!hidden)}
      pressed={hidden}
      tooltip="Hide ink"
    >
      <EyeOffIcon />
    </ToolbarButton>
  );
}
