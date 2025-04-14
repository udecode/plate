import { createTSlatePlugin } from '@udecode/plate';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import {
  type ProviderEventHandlers,
  type UnifiedProvider,
  type YjsConfig,
  createProvider,
} from './providers';
import { withPlateYjs } from './withPlateYjs';

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: 'yjs',
  extendEditor: withPlateYjs,
  options: {
    customProviders: [],
    isConnected: false,
    providerConfigs: [],
    providers: [],
    syncedProviderCount: 0,
    totalProviderCount: 0,
    waitForAllProviders: false,
    ydoc: undefined,
  },
}).extend(({ getOptions, setOption }) => {
  const { customProviders = [], providerConfigs = [], ydoc } = getOptions();

  // Validate configuration
  if (providerConfigs.length === 0 && customProviders.length === 0) {
    throw new Error(
      'No providers found. Please specify at least one provider in providerConfigs or customProviders.'
    );
  }

  // Define provider event handlers factory
  const createProviderHandlers = (): ProviderEventHandlers => ({
    onConnect: () => {
      // At least one provider is connected
      setOption('isConnected', true);
      console.log('onConnect', 'isConnected = true');
    },
    onDisconnect: () => {
      // Check for any connected providers
      const { providers } = getOptions();
      const hasConnectedProvider = providers.some(
        (provider) => provider.isConnected
      );
      if (!hasConnectedProvider) {
        setOption('isConnected', false);
        console.log('onDisconnect', 'isConnected = false');
      }
    },
    onError: (error) => {
      console.warn('[yjs] Provider error:', error);
    },
    onSyncChange: (isSynced) => {
      // Update the synced provider count based on the state change
      const { syncedProviderCount } = getOptions();
      const newCount = isSynced
        ? syncedProviderCount + 1
        : Math.max(0, syncedProviderCount - 1);

      setOption('syncedProviderCount', newCount);
      console.log('onSyncChange', 'syncedProviderCount =', newCount);
    },
  });

  // Final providers array that will contain both configured and custom providers
  const providers: UnifiedProvider[] = [];

  // Create a single shared Y.Doc if none was provided
  const sharedYDoc = ydoc || new Y.Doc();

  // Create a single shared Awareness instance for all providers
  const sharedAwareness = new Awareness(sharedYDoc);

  // Process external custom providers first
  for (const customProvider of customProviders) {
    // Check if the provider's document matches our shared document
    if (customProvider.document !== sharedYDoc) {
      console.warn(
        `[yjs] Custom provider (${customProvider.type}) has a different Y.Doc. ` +
          'This may cause synchronization issues.'
      );
    }

    // Add the custom provider to our providers array
    providers.push(customProvider);

    // Initial sync state tracking
    if (customProvider.isSynced) {
      setOption(
        'syncedProviderCount',
        (getOptions().syncedProviderCount || 0) + 1
      );
    }
  }

  // Then create providers from configurations
  for (const config of providerConfigs) {
    const { options, providerType } = config;

    if (!options) {
      console.warn(
        `[yjs] No options provided for provider type: ${providerType}`
      );
      continue;
    }

    try {
      // Create provider with shared handlers, Y.Doc, and Awareness
      const handlers = createProviderHandlers();

      // Use the factory function to create providers
      const provider = createProvider(
        providerType,
        options,
        handlers,
        sharedYDoc,
        sharedAwareness
      );

      providers.push(provider);
    } catch (error) {
      console.warn(
        `[yjs] Error creating provider of type ${providerType}:`,
        error
      );
    }
  }

  if (providers.length === 0) {
    console.warn('[yjs] No providers were successfully created or provided');
  }

  // Use the shared Y.Doc and Awareness for all providers
  return {
    options: {
      providers,
      sharedAwareness,
      totalProviderCount: providers.length,
      ydoc: sharedYDoc,
    },
  };
});
