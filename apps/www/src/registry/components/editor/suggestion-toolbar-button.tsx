'use client';

import { PencilLineIcon } from 'lucide-react';
import { AuthoredPlugin } from 'platejs/authored';
import {
  useEditor,
  useEditorSelector,
  useEditorViewState,
} from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
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
  const authored = editor.plugin(AuthoredPlugin);
  const isSuggesting = useEditorViewState(editor, () => {
    const view = authored.read.view();

    return 'intent' in view && view.intent === 'propose';
  });

  return (
    <ToolbarButton
      className={cn(isSuggesting && 'text-brand/80 hover:text-brand/80')}
      onClick={() => {
        authored.api.setView({ intent: isSuggesting ? 'edit' : 'propose' });
      }}
      tooltip={isSuggesting ? 'Turn off suggesting' : 'Suggestion edits'}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
