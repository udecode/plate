'use client';

import { PencilLineIcon } from 'lucide-react';
import { AuthoredPlugin } from 'platejs/authored';
import { AuthoredReactPlugin } from 'platejs/authored/react';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function SuggestionToolbarButton() {
  const installed = useEditorSelector(
    (editor) => editor.plugin(AuthoredReactPlugin).installed
  );

  if (!installed) return null;

  return <SuggestionToolbarButtonContent />;
}

function SuggestionToolbarButtonContent() {
  const editor = useEditor();
  const authored = editor.plugin(AuthoredPlugin);
  const isSuggesting = useEditorSelector(
    (current) => {
      const view = current.plugin(AuthoredPlugin).read.view();

      return 'intent' in view && view.intent === 'propose';
    },
    { dependsOn: 'authored' }
  );

  return (
    <ToolbarButton
      pressed={isSuggesting}
      onClick={() => {
        authored.api.setView({ intent: isSuggesting ? 'edit' : 'propose' });
      }}
      tooltip={isSuggesting ? 'Turn off suggesting' : 'Suggestion edits'}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
