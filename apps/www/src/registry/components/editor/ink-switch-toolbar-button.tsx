'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
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

export function ShowDigitizedToolbarButton() {
  const editor = useEditor();
  const showDigitized = useViewStore(InkPlugin, (state) => state.showDigitized);

  return (
    <ToolbarButton
      aria-label="Show digitized ink"
      onClick={() =>
        editor.plugin(InkPlugin).api.setShowDigitized(!showDigitized)
      }
      pressed={showDigitized}
      tooltip="Show digitized ink"
    >
      <EyeIcon />
    </ToolbarButton>
  );
}
