'use client';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import { PencilLineIcon } from 'lucide-react';
import { useEditorPlugin, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function SuggestionToolbarButton() {
  const { store } = useEditorPlugin(SuggestionPlugin);
  const isSuggesting = usePluginStore(SuggestionPlugin, 'isSuggesting');

  return (
    <ToolbarButton
      className={cn(isSuggesting && 'text-brand/80 hover:text-brand/80')}
      onClick={() => {
        store.set({ isSuggesting: !isSuggesting });
      }}
      tooltip={isSuggesting ? 'Turn off suggesting' : 'Suggestion edits'}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
