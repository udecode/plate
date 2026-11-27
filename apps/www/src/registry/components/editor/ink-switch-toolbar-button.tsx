'use client';

import { EyeIcon, EyeOffIcon, Trash2Icon } from 'lucide-react';
import { BaseInkPlugin } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import {
  useEditor,
  useEditorSelector,
  useEditorViewState,
  useViewStore,
} from 'platejs/react';

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

export function DropDigitizedToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (state) => state.isReadOnly());
  const hasDigitized = useEditorSelector((current) => {
    const ink = current.plugin(BaseInkPlugin);

    return ink.read.marks().length > ink.read.shownMarks().length;
  });

  return (
    <ToolbarButton
      aria-label="Drop digitized ink"
      disabled={readOnly || !hasDigitized}
      onClick={() => {
        editor.update((tx) => {
          tx.plugin(BaseInkPlugin).dropDigitized();
        });
      }}
      tooltip="Drop digitized ink"
    >
      <Trash2Icon />
    </ToolbarButton>
  );
}
