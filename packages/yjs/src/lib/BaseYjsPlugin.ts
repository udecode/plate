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
      } catch {}
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

      // Final providers array that will contain both configured and custom providers
      const finalProviders: UnifiedProvider[] = [];

      // Track sync state for waiting
      let syncResolve: (() => void) | null = null;
      const syncPromise = new Promise<void>((resolve) => {
        syncResolve = resolve;
      });

      // Create providers FIRST (before connecting YjsEditor)
      for (const item of providerConfigsOrInstances) {
        if (isProviderConfig(item)) {
          const { options: providerOptions, type } = item;

          if (!providerOptions) {
            continue;
          }

          try {
            const provider = createProvider({
              awareness,
              doc: ydoc,
              options: providerOptions,
              type,
              onConnect: () => {
                getOptions().onConnect?.({ type });
                setOption('_isConnected', true);
              },
              onDisconnect: () => {
                getOptions().onDisconnect?.({ type });

                const { _providers } = getOptions();
                const hasConnectedProvider = _providers.some(
                  (p) => p.isConnected
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

                // Resolve sync promise on first sync
                if (isSynced && syncResolve) {
                  syncResolve();
                  syncResolve = null;
                }
              },
            });
            finalProviders.push(provider);
          } catch {
            // Provider creation failed
          }
        } else {
          finalProviders.push(item);
        }
      }

      setOption('_providers', finalProviders);

      // Connect providers to start sync
      if (autoConnect) {
        finalProviders.forEach((provider) => {
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

      // Wait for first sync to complete (with timeout)
      const SYNC_TIMEOUT = 5000;
      await Promise.race([
        syncPromise,
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, SYNC_TIMEOUT);
        }),
      ]);

      // After sync, check if ydoc has content from server
      const sharedRoot = ydoc.get('content', Y.XmlText) as Y.XmlText;

      // Only apply initial value if ydoc is empty (no content from server)
      if (sharedRoot.length === 0 && value !== null) {
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
        if (customSharedType) {
          const delta = slateNodesToInsertDelta(initialNodes);
          ydoc.transact(() => {
            customSharedType.applyDelta(delta);
          });
        } else {
          const initialDelta = await slateToDeterministicYjsState(
            id ?? editor.id,
            initialNodes
          );
          ydoc.transact(() => {
            Y.applyUpdate(ydoc, initialDelta);
          });
        }
      }

      // NOW connect YjsEditor after sync is complete
      YjsEditor.connect(editor as any);

      editor.tf.init({
        autoSelect,
        selection,
        shouldNormalizeEditor: false,
        value: null,
      });

      // Force React to re-render by triggering onChange
      editor.api.onChange();

      // Call onReady callback
      onReady?.({ editor, isAsync: true, value: editor.children });
    },
  }));
