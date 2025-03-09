import type { HocuspocusProviderConfiguration, onDisconnectParameters, onSyncedParameters } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';
import type { Awareness } from 'y-protocols/awareness';
import type { WebrtcProvider } from 'y-webrtc';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { type PluginConfig, createTSlatePlugin } from '@udecode/plate';
import { WebrtcProvider as YWebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import type { WithYjsOptions } from './withTYjs';

import { withPlateYjs } from './withPlateYjs';

export interface ProviderEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSynced?: (data?: unknown) => void;
}

export interface UnifiedProvider {
  awareness: Awareness;
  document: Y.Doc;
  type: YjsProviderType;
  connect: () => void;
  destroy: () => void;
  disconnect: () => void;
}

export type WebRTCProviderOptions = {
  /** Room name for the collaboration */
  roomName: string;
  /** Whether to filter broadcast channel connections */
  filterBcConns?: boolean;
  /** Maximum number of WebRTC connections */
  maxConns?: number;
  /** Optional password for the room */
  password?: string;
  /** Additional peer options for simple-peer */
  peerOpts?: Record<string, unknown>;
  /** Optional signaling servers. Defaults to public servers if not specified */
  signaling?: string[];
};

export type YjsConfig = PluginConfig<
  'yjs',
  {
    isConnected: boolean;
    isSynced: boolean;
    provider: UnifiedProvider;
    /** WithCursors options */
    cursorOptions?: WithCursorsOptions;
    disableCursors?: boolean;
    /** HocuspocusProvider configuration Required if providerType is 'hocuspocus' */
    hocuspocusProviderOptions?: HocuspocusProviderConfiguration;
    /** 
     * Provider type - defaults to 'hocuspocus' for backward compatibility
     * If not specified, it will be automatically determined based on which provider options are provided:
     * - If webrtcProviderOptions is provided, it will be 'webrtc'
     * - Otherwise, it will be 'hocuspocus'
     */
    providerType?: YjsProviderType;
    /** WebRTC provider configuration Required if providerType is 'webrtc' */
    webrtcProviderOptions?: WebRTCProviderOptions;
    /** WithYjs options */
    yjsOptions?: WithYjsOptions;
  }
>;

export type YjsProviderType = 'hocuspocus' | 'webrtc';

// Abstract base class for providers
abstract class BaseProviderWrapper implements UnifiedProvider {
  abstract type: YjsProviderType;
  // Common functionality could go here
  protected setupHandlers(handlers: ProviderEventHandlers) {
    // Common handler setup logic
  }
  abstract connect(): void;
  abstract destroy(): void;
  abstract disconnect(): void;
  abstract get awareness(): Awareness;
  
  abstract get document(): Y.Doc;
}

class HocuspocusProviderWrapper extends BaseProviderWrapper {
  private provider: HocuspocusProvider;
  destroy = () => this.provider.disconnect();
  
  disconnect = () => this.provider.disconnect();
  
  type: YjsProviderType = 'hocuspocus';
  
  constructor(options: HocuspocusProviderConfiguration, handlers?: ProviderEventHandlers) {
    super();
    this.provider = new HocuspocusProvider({
      ...options,
      onAwarenessChange() {},
      onConnect() {
        handlers?.onConnect?.();
        options.onConnect?.();
      },
      onDisconnect(data: onDisconnectParameters) {
        handlers?.onDisconnect?.();
        options.onDisconnect?.(data);
      },
      onSynced(data: onSyncedParameters) {
        handlers?.onSynced?.(data as unknown);
        options.onSynced?.(data);
      },
    });
  }
  
  connect() {
    void this.provider.connect();
  }
  
  get awareness() {
    return this.provider.awareness!;
  }
  
  get document() {
    return this.provider.document;
  }
}

class WebRTCProviderWrapper extends BaseProviderWrapper {
  private doc: Y.Doc;
  private provider: WebrtcProvider;
  connect = () => {
    this.provider.connect();
  };
  
  destroy = () => this.provider.destroy();
  
  disconnect = () => {
    this.provider.disconnect();
  };
  
  type: YjsProviderType = 'webrtc';
  
  constructor(options: WebRTCProviderOptions, handlers?: ProviderEventHandlers) {
    super();
    this.doc = new Y.Doc();
    this.provider = new YWebrtcProvider(options.roomName, this.doc, {
      filterBcConns: options.filterBcConns,
      maxConns: options.maxConns,
      password: options.password,
      peerOpts: options.peerOpts,
      signaling: options.signaling,
    });
    
    // Set connection status
    this.provider.on('status', (status: { connected: boolean }) => {
      if (status.connected) {
        handlers?.onConnect?.();
        handlers?.onSynced?.();
      } else {
        handlers?.onDisconnect?.();
      }
    });

    this.provider.on('synced', ({ synced }: { synced: boolean }) => {
      if (synced) {
        handlers?.onSynced?.();
      }
    });
  }
  
  get awareness() {
    return this.provider.awareness;
  }
  
  get document() {
    return this.provider.doc;
  }
}

// Provider registry for extensibility
const providerRegistry: Record<
  YjsProviderType, 
  new (options: any, handlers: ProviderEventHandlers) => UnifiedProvider
> = {
  'hocuspocus': HocuspocusProviderWrapper,
  'webrtc': WebRTCProviderWrapper,
};

// Register a new provider type
export const registerProviderType = <T>(
  type: string, 
  providerClass: new (options: T, handlers: ProviderEventHandlers) => UnifiedProvider
) => {
  providerRegistry[type as YjsProviderType] = providerClass;
};

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: 'yjs',
  extendEditor: withPlateYjs,
  options: {
    isConnected: false,
    isSynced: false,
    provider: {} as any,
  },
}).extend(({ getOptions, setOption }) => {
  const {
    hocuspocusProviderOptions,
    providerType,
    webrtcProviderOptions,
  } = getOptions();

  // Determine provider type based on which options are provided
  let effectiveProviderType = providerType;
  
  if (!effectiveProviderType) {
    if (webrtcProviderOptions) {
      effectiveProviderType = 'webrtc';
    } else {
      // Default to hocuspocus for backward compatibility
      effectiveProviderType = 'hocuspocus';
    }
  }

  if (effectiveProviderType === 'hocuspocus' && !hocuspocusProviderOptions) {
    throw new Error(
      'HocuspocusProvider configuration is required when using hocuspocus provider'
    );
  }

  if (effectiveProviderType === 'webrtc' && !webrtcProviderOptions) {
    throw new Error(
      'WebRTC provider configuration is required when using webrtc provider'
    );
  }

  // Common event handlers for both provider types
  const handlers: ProviderEventHandlers = {
    onConnect: () => setOption('isConnected', true),
    onDisconnect: () => {
      setOption('isConnected', false);
      setOption('isSynced', false);
    },
    onSynced: () => setOption('isSynced', true),
  };

  // Get the appropriate options based on provider type
  const providerOptions = effectiveProviderType === 'webrtc' 
    ? webrtcProviderOptions! 
    : hocuspocusProviderOptions!;

  // Create provider using registry
  const ProviderClass = providerRegistry[effectiveProviderType];
  const provider = new ProviderClass(providerOptions, handlers);

  return {
    options: { provider },
  };
});
