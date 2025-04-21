import { YjsEditor } from '@slate-yjs/core';
import { createTSlatePlugin } from '@udecode/plate';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { slateToDeterministicYjsState } from '../utils/slateToDeterministicYjsState';
import {
  type UnifiedProvider,
  type YjsConfig,
  type YjsProviderConfig,
  type YjsProviderType,
  createProvider,
} from './providers';
import { withPlateYjs } from './withPlateYjs';

// Helper to check if an object is a provider config
const isProviderConfig = (
  item: UnifiedProvider | YjsProviderConfig
): item is YjsProviderConfig => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    'options' in item
  );
};

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: 'yjs',
  options: {
    _awareness: null!,
    _isConnected: false,
    _isSynced: false,
    _providers: [],
    _syncedProviderCount: 0,
    _totalProviderCount: 0,
    cursorOptions: {},
    initialValue: undefined,
    providers: [],
    waitForAllProviders: false,
    ydoc: null!,
    yjsOptions: {},
    onConnect: () => {},
    onDisconnect: () => {},
    onError: () => {},
    onSyncChange: () => {},
  },
})
  .overrideEditor(({ api: { shouldNormalizeNode }, getOptions }) => ({
    api: {
      shouldNormalizeNode(entry) {
        const { _isSynced } = getOptions();

        if (!_isSynced) {
          return false;
        }

        return shouldNormalizeNode(entry);
      },
    },
  }))
  .extendApi((ctx) => ({
    /**
     * Connect to all providers or specific provider types.
     *
     * @param type Optional provider type(s) to connect to. If not specified,
     *   connects to all providers.
     */
    connect: (type?: YjsProviderType | YjsProviderType[]) => {
      const { getOptions } = ctx;
      const { _providers } = getOptions();
      const typesToConnect = type
        ? Array.isArray(type)
          ? type
          : [type]
        : null;

      _providers.forEach((provider) => {
        if (!typesToConnect || typesToConnect.includes(provider.type)) {
          try {
            provider.connect();
          } catch (error) {
            getOptions().onError?.({
              error: error instanceof Error ? error : new Error(String(error)),
              type: provider.type,
            });
          }
        }
      });
    },

    /**
     * Disconnect from all providers or specific provider types. For WebRTC
     * providers, we should NOT disconnect on cleanup as it will clear the
     * awareness state. Instead, we'll let the providers handle their own
     * cleanup via their internal mechanisms.
     *
     * @param providerType Optional provider type(s) to disconnect from. If not
     *   specified, disconnects from all providers.
     */
    destroy: () => {
      const { editor, getOptions } = ctx;
      const { _providers } = getOptions();

      for (const provider of [..._providers].reverse()) {
        try {
          if (provider.isConnected) {
            provider.destroy();
          }
        } catch (error) {
          console.warn(
            `[yjs] Error disconnecting provider (${provider.type}):`,
            error
          );
        }
      }

      try {
        YjsEditor.disconnect(editor as any);
      } catch (error) {}
    },
    /**
     * Disconnect from all providers or specific provider types. For WebRTC
     * providers, we should NOT disconnect on cleanup as it will clear the
     * awareness state. Instead, we'll let the providers handle their own
     * cleanup via their internal mechanisms.
     *
     * @param providerType Optional provider type(s) to disconnect from. If not
     *   specified, disconnects from all providers.
     */
    disconnect: (type?: YjsProviderType | YjsProviderType[]) => {
      const { editor, getOptions } = ctx;
      const { _providers } = getOptions();

      const typesToDisconnect = type
        ? Array.isArray(type)
          ? type
          : [type]
        : null;

      for (const provider of [..._providers].reverse()) {
        try {
          if (
            provider.isConnected &&
            (typesToDisconnect === null ||
              typesToDisconnect.includes(provider.type))
          ) {
            provider.disconnect();
          }
        } catch (error) {
          console.warn(
            `[yjs] Error disconnecting provider (${provider.type}):`,
            error
          );
        }
      }
    },

    /** Initialize the Yjs providers. This should be called only once. */
    init: ({ autoConnect = true }: { autoConnect?: boolean } = {}) => {
      const { editor, getOptions, setOption } = ctx;

      const options = getOptions();
      const { _providers, providers: providerConfigsOrInstances = [] } =
        options;
      let ydoc = options.ydoc;

      // Validate configuration
      if (providerConfigsOrInstances.length === 0) {
        throw new Error(
          'No providers specified. Please provide provider configurations or instances in the `providers` array.'
        );
      }

      if (!ydoc) {
        ydoc = new Y.Doc();
        setOption('ydoc', ydoc);
      }

      if (options.initialValue) {
        const initialDelta = slateToDeterministicYjsState(
          'doc-id', // A unique identifier for the document would be ideal.
          options.initialValue
        );
        ydoc.transact(() => {
          Y.applyUpdate(ydoc, initialDelta);
        });
      }

      // Final providers array that will contain both configured and custom providers
      const finalProviders: UnifiedProvider[] = [];
      let initialSyncedCount = 0;

      // Create a single shared Awareness instance for all providers
      const awareness = new Awareness(ydoc);
      setOption('_awareness', awareness);

      withPlateYjs(ctx);

      // Connect the YjsEditor first to set up slate-yjs bindings
      YjsEditor.connect(editor as any);

      // Then process and create providers
      for (const item of providerConfigsOrInstances) {
        if (isProviderConfig(item)) {
          // It's a configuration object, create the provider
          const { options, type } = item;

          if (!options) {
            console.warn(
              `[yjs] No options provided for provider type: ${type}`
            );
            continue;
          }

          try {
            // Create provider with shared handlers, Y.Doc, and Awareness
            const provider = createProvider({
              awareness,
              doc: ydoc,
              options,
              type,
              onConnect: () => {
                getOptions().onConnect?.({ type });
                // At least one provider is connected
                setOption('_isConnected', true);
              },
              onDisconnect: () => {
                getOptions().onDisconnect?.({ type });

                // Check for any connected providers
                const { _providers } = getOptions();
                const hasConnectedProvider = _providers.some(
                  (provider) => provider.isConnected
                );
                if (!hasConnectedProvider) {
                  setOption('_isConnected', false);
                }
              },
              onError: (error) => {
                getOptions().onError?.({ error, type });
              },
              onSyncChange: (isSynced) => {
                getOptions().onSyncChange?.({ isSynced, type });
                setOption('_isSynced', isSynced);
                // Update the synced provider count based on the state change
                const { _syncedProviderCount } = getOptions();
                const newCount = isSynced
                  ? _syncedProviderCount + 1
                  : Math.max(0, _syncedProviderCount - 1);

                setOption('_syncedProviderCount', newCount);
              },
            });
            finalProviders.push(provider);

            // Track initial sync state for created providers
            if (provider.isSynced) {
              initialSyncedCount++;
            }
          } catch (error) {
            console.warn(
              `[yjs] Error creating provider of type ${type}:`,
              error
            );
          }
        } else {
          // It's a pre-instantiated UnifiedProvider instance
          const customProvider = item;

          // Check if the provider's document matches our shared document
          if (customProvider.document !== ydoc) {
            console.warn(
              `[yjs] Custom provider instance (${customProvider.type}) has a different Y.Doc. ` +
                'This may cause synchronization issues. Ensure custom providers use the shared Y.Doc.'
            );
          }
          // Check if the provider's awareness matches our shared awareness
          if (customProvider.awareness !== awareness) {
            console.warn(
              `[yjs] Custom provider instance (${customProvider.type}) has a different Awareness instance. ` +
                'Ensure custom providers use the shared Awareness instance for cursor consistency.'
            );
          }

          // Add the custom provider to our providers array
          finalProviders.push(customProvider);

          // Track initial sync state for custom providers
          if (customProvider.isSynced) {
            initialSyncedCount++;
          }
        }
      }

      if (finalProviders.length === 0) {
        console.warn(
          '[yjs] No providers were successfully created or provided.'
        );
      }

      // Update provider counts after creation
      setOption('_providers', finalProviders);
      setOption('_syncedProviderCount', initialSyncedCount);
      setOption('_totalProviderCount', finalProviders.length);

      // Finally, connect providers if autoConnect is true
      if (autoConnect) {
        _providers.forEach((provider) => {
          try {
            provider.connect();
          } catch (error) {
            getOptions().onError?.({
              error: error instanceof Error ? error : new Error(String(error)),
              type: provider.type,
            });
          }
        });
      }
    },
  }));
