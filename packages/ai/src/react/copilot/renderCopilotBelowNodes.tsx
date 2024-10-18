'use client';

import React from 'react';

import {
  type NodeWrapperComponentProps,
  getEditorPlugin,
} from '@udecode/plate-common/react';

import type { CopilotPluginConfig } from './CopilotPlugin';

export const renderCopilotBelowNodes = ({
  editor,
}: NodeWrapperComponentProps<CopilotPluginConfig>) => {
  const copilot = getEditorPlugin<CopilotPluginConfig>(editor, {
    key: 'copilot',
  });

  const { renderGhostText: GhostText } = copilot.getOptions();

  if (!GhostText) return;

  return function Component({ children }: { children: React.ReactNode }) {
    return (
      <React.Fragment>
        {children}

        <GhostText />
      </React.Fragment>
    );
  };
};
