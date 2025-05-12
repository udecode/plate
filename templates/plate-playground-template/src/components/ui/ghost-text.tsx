'use client';

import * as React from 'react';

import { CopilotPlugin } from '@udecode/plate-ai/react';
import { useElement, usePluginOption } from '@udecode/plate/react';

export const GhostText = () => {
  const element = useElement();

  const isSuggested = usePluginOption(
    CopilotPlugin,
    'isSuggested',
    element.id as string
  );

  if (!isSuggested) return null;

  return <GhostTextContent />;
};

export function GhostTextContent() {
  const suggestionText = usePluginOption(CopilotPlugin, 'suggestionText');

  return (
    <span
      className="pointer-events-none text-muted-foreground/70 max-sm:hidden"
      contentEditable={false}
    >
      {suggestionText && suggestionText}
    </span>
  );
}
