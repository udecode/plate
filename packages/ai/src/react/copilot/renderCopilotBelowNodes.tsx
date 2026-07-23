'use client';

import React from 'react';

import type { WithAnyKey } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import type { RenderNodeWrapperProps } from '@platejs/core/react';

import type { CopilotPluginConfig } from './CopilotPlugin';

export const renderCopilotBelowNodes = ({
  editor,
}: RenderNodeWrapperProps<WithAnyKey<CopilotPluginConfig>>) => {
  const copilot = editor.plugin<CopilotPluginConfig>({ key: KEYS.copilot });

  const { renderGhostText: GhostText } = copilot.getOptions();

  if (!GhostText) return;

  return ({ children }: { children: React.ReactNode }) => (
    <>
      {children}

      <GhostText />
    </>
  );
};
