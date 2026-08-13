'use client';

import * as React from 'react';

import { CopilotPlugin } from '@platejs/ai/react';
import { useEditor, useElement, usePluginStore } from 'platejs/react';

export function GhostText() {
  const editor = useEditor();
  const element = useElement();

  const isSuggested = usePluginStore(
    CopilotPlugin,
    'isSuggested',
    editor.key(element)
  );

  if (!isSuggested) return null;

  return <GhostTextContent />;
}

function GhostTextContent() {
  const suggestionText = usePluginStore(CopilotPlugin, 'suggestionText');

  return (
    <span
      className="pointer-events-none text-muted-foreground/70 max-sm:hidden"
      contentEditable={false}
    >
      {suggestionText && suggestionText}
    </span>
  );
}
