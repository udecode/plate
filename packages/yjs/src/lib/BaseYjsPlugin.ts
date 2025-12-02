import { slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';
import {
  type InitOptions,
  type Value,
  createTSlatePlugin,
  KEYS,
} from 'platejs';
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
): item is YjsProviderConfig =>
  typeof item === 'object' &&
  item !== null &&
  'type' in item &&
  'options' in item;

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: KEYS.yjs,
  extendEditor: withPlateYjs,
  options: {
    _isConnected: false,
    _isSynced: false,
    _providers: [],
    awareness: null!,
    cursors: {},
    localOrigin: null,
    positionStorageOrigin: null,
    providers: [],
    sharedType: null,
    ydoc: null!,
    onConnect: () => {},
    onDisconnect: () => {},
    onError: () => {},
    onSyncChange: () => {},
  },
})
  .extend(({ getOptions }) => {
    const { localOrigin, positionStorageOrigin, ...options } = getOptions();
    let { awareness, ydoc } = options;

    if (!ydoc) {
      ydoc = new Y.Doc();
    }

    if (!awareness) {
      awareness = new Awareness(ydoc);
    }

    return {
      options: {
        awareness,
        localOrigin: localOrigin ?? undefined,
        positionStorageOrigin: positionStorageOrigin ?? undefined,
        ydoc,
      },
    };
  })
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
      } catch (_error) {}
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
      const { editor: _editor, getOptions } = ctx;
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

    /** Initialize yjs, providers connection and editor state. */
    init: async ({
      id,
      autoConnect = true,
      autoSelect,
      selection,
      value,
      onReady,
    }: {
      /**
       * Id of the document.
       *
       * @default editor.id
       */
      id?: string;
      /**
       * Whether to automatically connect to providers.
       *
       * @default true
       */
      autoConnect?: boolean;
    } & Omit<InitOptions, 'shouldNormalizeEditor'> = {}) => {
      const { editor, getOptions, setOption } = ctx;

      const options = getOptions();
      const {
        _providers,
        awareness,
        providers: providerConfigsOrInstances = [],
        sharedType: customSharedType,
        ydoc,
      } = options;

      // Validate configuration
      if (providerConfigsOrInstances.length === 0) {
        throw new Error(
          'No providers specified. Please provide provider configurations or instances in the `providers` array.'
        );
      }

      if (value !== null) {
        let initialNodes = value as Value;
        if (typeof value === 'string') {
          initialNodes = editor.api.html.deserialize({
            element: value,
          }) as Value;
        } else if (typeof value === 'function') {
          initialNodes = await value(editor);
        } else if (value) {
          initialNodes = value;
        }
        if (!initialNodes || initialNodes?.length === 0) {
          initialNodes = editor.api.create.value();
        }

        // Use custom sharedType if provided, otherwise use default 'content'
        if (customSharedType) {
          // Apply initial value directly to the custom shared type
          const delta = slateNodesToInsertDelta(initialNodes);
          ydoc.transact(() => {
            customSharedType.applyDelta(delta);
          });
        } else {
          // Use deterministic state for default 'content' key
          const initialDelta = await slateToDeterministicYjsState(
            id ?? editor.id,
            initialNodes
          );
          ydoc.transact(() => {
            Y.applyUpdate(ydoc, initialDelta);
          });
        }
      }

      // Final providers array that will contain both configured and custom providers
      const finalProviders: UnifiedProvider[] = [];

      // Connect the YjsEditor first to set up slate-yjs bindings.
      YjsEditor.connect(editor as any);

      editor.tf.init({
        autoSelect,
        selection,
        // Skipped since YjsEditor.connect already normalizes the editor
        shouldNormalizeEditor: false,
        value: null,
        onReady,
      });

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
              },
            });
            finalProviders.push(provider);
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
        }
      }

      if (finalProviders.length === 0) {
        console.warn(
          '[yjs] No providers were successfully created or provided.'
        );
      }

      // Update provider counts after creation
      setOption('_providers', finalProviders);

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
