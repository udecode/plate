import type {
  HocuspocusProviderConfiguration,
  HocuspocusProviderWebsocketConfiguration,
} from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';
import type { PluginConfig } from 'platejs';
import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import type { WithYjsOptions } from '../withTYjs';

// Base config structure for provider configurations
export interface BaseYjsProviderConfig extends ProviderEventHandlers {
  options: Record<string, any>;
  type: string;
}

// Built-in provider types
export type DefaultYjsProviderType = 'hocuspocus' | 'webrtc';

export type HocuspocusProviderConfig = BaseYjsProviderConfig & {
  options: HocuspocusProviderConfiguration;
  type: 'hocuspocus';
  wsOptions?: HocuspocusProviderWebsocketConfiguration;
};

// Provider constructor type
export type ProviderConstructor<T = any> = new (
  props: ProviderConstructorProps<T>
) => UnifiedProvider;

export type ProviderConstructorProps<T = any> = {
  options: T;
  awareness?: Awareness;
  doc?: Y.Doc;
} & ProviderEventHandlers;

export type ProviderEventHandlers = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  /**
   * Called when provider sync state changes
   *
   * @param isSynced Whether the provider is now synced
   */
  onSyncChange?: (isSynced: boolean) => void;
};

// Provider registry type
export type ProviderRegistry = Record<string, ProviderConstructor>;

// Unified interface for all provider types
export type UnifiedProvider = {
  awareness: Awareness;
  document: Y.Doc;
  type: string;
  connect: () => void;
  destroy: () => void;
  disconnect: () => void;
  /**
   * Whether this provider is currently connected Used for provider-specific
   * connection status
   */
  isConnected: boolean;
  /**
   * Whether this provider is synced with its persistence layer Used for
   * provider-specific sync status
   */
  isSynced: boolean;
};

export type WebRTCProviderConfig = BaseYjsProviderConfig & {
  options: WebRTCProviderOptions;
  type: 'webrtc';
};

export type WebRTCProviderOptions = {
  /** Room name for the collaboration */
  roomName: string;
  awareness?: Awareness;
  /** Whether to filter broadcast channel connections */
  filterBcConns?: boolean;
  /** Maximum number of WebRTC connections */
  maxConns?: number;
  /** Optional password for the room */
  password?: string;
  /**
   * Additional peer options for simple-peer. See
   * [simple-peer](https://github.com/feross/simple-peer#api) for more details.
   */
  peerOpts?: Record<string, unknown>;
  /** Optional signaling servers. Defaults to public servers if not specified */
  signaling?: string[];
};

export type IndexeddbProviderConfiguration = {
  docName: string;
  ydoc?: Y.Doc;
};

export type IndexeddbProviderConfig = BaseYjsProviderConfig & {
  options: IndexeddbProviderConfiguration;
  type: 'indexeddb';
};

export type YjsConfig = PluginConfig<
  'yjs',
  {
    /** Whether any provider is currently connected. */
    _isConnected: boolean;
    /** Whether the plugin is currently synced. */
    _isSynced: boolean;
    /** The current user ID. */
    userId: string | null;
    /** Array of all active, instantiated providers. */
    _providers: UnifiedProvider[];
    /** The shared Awareness instance used by the plugin. */
    awareness: Awareness;
    /**
     * Array of provider configurations or pre-instantiated provider instances.
     * The plugin will create instances from configurations and use existing
     * instances directly. All providers will share the same Y.Doc and
     * Awareness.
     */
    providers: (UnifiedProvider | YjsProviderConfig)[];
    /**
     * Configuration for remote cursors. Set to `null` to explicitly disable
     * cursors. If omitted, cursors are enabled by default if providers are
     * specified. Passed to `withTCursors`.
     */
    cursors?: WithCursorsOptions | null;
    /**
     * Custom shared type to use for the editor content. If provided, this will
     * be used instead of the default `ydoc.get('content', Y.XmlText)`. This
     * allows you to use a nested Y.XmlText from a parent Y.Doc structure.
     *
     * @example
     *   ```ts
     *   const parentDoc = new Y.Doc();
     *   const editorContent = parentDoc
     *     .getMap('editors')
     *     .get('main', Y.XmlText);
     *
     *   YjsPlugin.configure({
     *     ydoc: parentDoc,
     *     sharedType: editorContent,
     *     // ...
     *   });
     *   ```;
     */
    sharedType?: Y.XmlText | null;
    /**
     * Shared Y.Doc instance. If not provided by the user in the initial config,
     * a new one will be created and assigned here by the plugin.
     */
    ydoc?: Y.Doc;
    /** Called when the plugin is connected to a provider. */
    onConnect?: (props: { type: YjsProviderType }) => void;
    /** Called when the plugin is disconnected from a provider. */
    onDisconnect?: (props: { type: YjsProviderType }) => void;
    /** Called when the plugin encounters an error. */
    onError?: (props: { error: Error; type: YjsProviderType }) => void;
    /** Called when the plugin's sync state changes. */
    onSyncChange?: (props: {
      isSynced: boolean;
      type: YjsProviderType;
    }) => void;
  } & Omit<WithYjsOptions, 'autoConnect'>
>;

// Union type for all known provider configurations
export type YjsProviderConfig =
  | HocuspocusProviderConfig
  | IndexeddbProviderConfig
  | WebRTCProviderConfig; // Add custom config types here if needed

// Extensible provider type that can include custom types
export type YjsProviderType = DefaultYjsProviderType | string;
