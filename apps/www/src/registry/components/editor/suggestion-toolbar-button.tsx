'use client';

import { PencilLineIcon } from 'lucide-react';
import { useEditor, useEditorSelector } from 'platejs/react';
import { SuggestionPlugin, useSuggestionMode } from 'platejs/suggestion/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function SuggestionToolbarButton() {
  const installed = useEditorSelector(
    (editor) => editor.plugin(SuggestionPlugin).installed
  );

  if (!installed) return null;

  return <SuggestionToolbarButtonContent />;
}

function SuggestionToolbarButtonContent() {
  const editor = useEditor();
  const mode = useSuggestionMode();
  const isSuggesting = mode === 'suggesting';

  return (
    <ToolbarButton
      className={cn(isSuggesting && 'text-brand/80 hover:text-brand/80')}
      onClick={() => {
        editor
          .plugin(SuggestionPlugin)
          .api.setMode(isSuggesting ? 'editing' : 'suggesting');
      }}
      tooltip={isSuggesting ? 'Turn off suggesting' : 'Suggestion edits'}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
