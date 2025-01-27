'use client';

import React from 'react';

import {
  type RenderNodeWrapperProps,
  getEditorPlugin,
} from '@udecode/plate/react';

import type { CopilotPluginConfig } from './CopilotPlugin';

export const renderCopilotBelowNodes = ({
  editor,
}: RenderNodeWrapperProps<CopilotPluginConfig>) => {
  const copilot = getEditorPlugin<CopilotPluginConfig>(editor, {
    key: 'copilot',
  });

  const { renderGhostText: GhostText } = copilot.getOptions();

  if (!GhostText) return;

  return ({ children }: { children: React.ReactNode }) => {
    return (
      <React.Fragment>
        {children}

        <GhostText />
      </React.Fragment>
    );
  };
};
