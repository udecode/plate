'use client';

import React from 'react';

import { KEYS } from '@platejs/utils';
import type { RenderNodeWrapperProps } from '@platejs/core/react';

import type { CopilotPluginConfig } from './CopilotPlugin';

export const renderCopilotBelowNodes = ({
  editor,
}: RenderNodeWrapperProps<CopilotPluginConfig>) => {
  const copilot = editor.plugin<CopilotPluginConfig>(KEYS.copilot);

  const { renderGhostText: GhostText } = copilot.getOptions();

  if (!GhostText) return;

  return ({ children }: { children: React.ReactNode }) => (
    <>
      {children}

      <GhostText />
    </>
  );
};
