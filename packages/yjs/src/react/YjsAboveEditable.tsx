import React from 'react';

import { YjsEditor } from '@slate-yjs/core';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { UnifiedProvider, YjsConfig } from '../lib/providers/types';

import { BaseYjsPlugin } from '../lib/BaseYjsPlugin';

export interface YjsAboveEditableProps {
  children: React.ReactNode;
}

export function YjsAboveEditable({ children }: YjsAboveEditableProps) {
  const { editor } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);
  const providersFromPlugin = usePluginOption(BaseYjsPlugin, 'providers');
  const ydoc = usePluginOption(BaseYjsPlugin, 'ydoc');
  const syncedProviderCount = usePluginOption(
    BaseYjsPlugin,
    'syncedProviderCount'
  );
  const totalProviderCount = usePluginOption(
    BaseYjsPlugin,
    'totalProviderCount'
  );
  const waitForAllProviders = usePluginOption(
    BaseYjsPlugin,
    'waitForAllProviders'
  );

  const providers = React.useMemo(() => {
    return providersFromPlugin || [];
  }, [providersFromPlugin]) as UnifiedProvider[];

  // Connect all providers when component mounts
  React.useEffect(() => {
    // Connect all providers synchronously
    for (const provider of providers) {
      try {
        if (!provider.isConnected) {
          provider.connect();
        }
      } catch (error) {
        console.warn(
          `[yjs] Error connecting provider (${provider.type}):`,
          error
        );
      }
    }

    // For WebRTC providers, we should NOT disconnect on cleanup
    // as it will clear the awareness state. Instead, we'll let the
    // providers handle their own cleanup via their internal mechanisms.
    return () => {
      for (const provider of [...providers].reverse()) {
        try {
          if (provider.isConnected && provider.type !== 'webrtc') {
            provider.disconnect();
          }
        } catch (error) {
          console.warn(
            `[yjs] Error disconnecting provider (${provider.type}):`,
            error
          );
        }
      }
    };
  }, [providers]);

  // Connect editor to Y.Doc only once when providers are ready
  React.useEffect(() => {
    if (!editor) return;
    YjsEditor.connect(editor as any);

    return () => {
      YjsEditor.disconnect(editor as any);
    };
  }, [editor, ydoc]);

  // Determine if we should render content
  const shouldRender = waitForAllProviders
    ? syncedProviderCount >= totalProviderCount && totalProviderCount > 0
    : syncedProviderCount > 0; // At least one provider is synced

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
