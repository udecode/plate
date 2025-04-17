import React from 'react';

import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { YjsConfig } from '../lib/providers/types';

import { BaseYjsPlugin } from '../lib/BaseYjsPlugin';

export interface YjsAboveEditableProps {
  children: React.ReactNode;
}

export function YjsAboveEditable({ children }: YjsAboveEditableProps) {
  const { editor } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);
  const providers = usePluginOption(BaseYjsPlugin, '_providers');
  const ydoc = usePluginOption(BaseYjsPlugin, 'ydoc');
  const syncedProviderCount =
    usePluginOption(BaseYjsPlugin, '_syncedProviderCount') ?? 0;
  const totalProviderCount =
    usePluginOption(BaseYjsPlugin, '_totalProviderCount') ?? 0;
  const waitForAllProviders = usePluginOption(
    BaseYjsPlugin,
    'waitForAllProviders'
  );

  // Connect all providers when component mounts
  React.useEffect(() => {
    // // Connect all providers synchronously
    // for (const provider of providers) {
    //   try {
    //     if (!provider.isConnected) {
    //       provider.connect();
    //     }
    //   } catch (error) {
    //     console.warn(
    //       `[yjs] Error connecting provider (${provider.type}):`,
    //       error
    //     );
    //   }
    // }
  }, [providers]);

  // Connect editor to Y.Doc only once when providers are ready
  // React.useEffect(() => {
  //   if (!editor) return;
  //   YjsEditor.connect(editor as any);

  //   return () => {
  //     YjsEditor.disconnect(editor as any);
  //   };
  // }, [editor, ydoc]);

  // // Ensure counts are numbers for comparison
  // const numSynced =
  //   typeof syncedProviderCount === 'number' ? syncedProviderCount : 0;
  // const numTotal =
  //   typeof totalProviderCount === 'number' ? totalProviderCount : 0;

  // // Determine if we should render content
  // const shouldRender =
  //   waitForAllProviders && numTotal > 0
  //     ? numSynced >= numTotal // Wait for all if configured and providers exist
  //     : numSynced > 0; // Otherwise, render if at least one is synced

  // if (!shouldRender) {
  //   return null;
  // }

  // return <>{children}</>;
}
