import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';
import type { PluginConfig } from '@udecode/plate';
import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import type { WithYjsOptions } from '../withTYjs';

// Built-in provider types
export type DefaultYjsProviderType = 'hocuspocus' | 'webrtc';

export type HocuspocusProviderConfig = {
  options: HocuspocusProviderConfiguration;
  providerType: 'hocuspocus';
  waitForSync?: boolean;
};

// Provider constructor type
export type ProviderConstructor<T = any> = new (
  options: T, 
  handlers: ProviderEventHandlers, 
  existingDoc?: Y.Doc, 
  sharedAwareness?: Awareness
) => UnifiedProvider;

export interface ProviderEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  /**
   * Called when provider sync state changes
   * @param isSynced Whether the provider is now synced
   */
  onSyncChange?: (isSynced: boolean) => void;
}

// Provider registry type
export type ProviderRegistry = Record<
  string, 
  ProviderConstructor
>;

// Unified interface for all provider types
export interface UnifiedProvider {
  awareness: Awareness;
  document: Y.Doc;
  type: string;
  connect: () => void;
  destroy: () => void;
  disconnect: () => void;
  /**
   * Whether this provider is currently connected
   * Used for provider-specific connection status
   */
  isConnected: boolean;
  /**
   * Whether this provider is synced with its persistence layer
   * Used for provider-specific sync status
   */
  isSynced: boolean;
}

export type WebRTCProviderConfig = {
  options: WebRTCProviderOptions;
  providerType: 'webrtc';
  waitForSync?: boolean;
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
  /** Additional peer options for simple-peer. See [simple-peer](https://github.com/feross/simple-peer#api) for more details. */
  peerOpts?: Record<string, unknown>; 
  /** Optional signaling servers. Defaults to public servers if not specified */
  signaling?: string[];
};

export type YjsConfig = PluginConfig<
  'yjs',
  {
    /** Whether any provider is connected - global connection status */
    isConnected: boolean;
    /** Configuration for all providers */
    providerConfigs: YjsProviderConfig[];
    /** All active providers */
    providers: UnifiedProvider[];
    /** 
     * Number of providers that are currently synced 
     * This is used for sync state tracking
     */
    syncedProviderCount: number;
    /** Total number of active providers */
    totalProviderCount: number;
    /** Shared Y.Doc used by all providers */
    ydoc: Y.Doc | undefined;
    /** WithCursors options */
    cursorOptions?: WithCursorsOptions;
    /** 
     * Pre-instantiated custom providers that implement the UnifiedProvider interface
     * These will be used alongside providers created from providerConfigs
     */
    customProviders?: UnifiedProvider[];
    /** Whether to disable cursor support */
    disableCursors?: boolean;
    /** Shared Awareness instance used by all providers */
    sharedAwareness?: Awareness;
    /** 
     * Whether to wait for all providers to be synced before rendering content
     * If false (default), content will render as soon as at least one provider is synced
     */
    waitForAllProviders?: boolean;
    /** WithYjs options */
    yjsOptions?: WithYjsOptions;
  }
>;

export type YjsProviderConfig = HocuspocusProviderConfig | WebRTCProviderConfig;

// Extensible provider type that can include custom types
export type YjsProviderType = DefaultYjsProviderType | string; 