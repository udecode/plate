import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';
import type { Awareness } from 'y-protocols/awareness';
import type { WebrtcProvider } from 'y-webrtc';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { type PluginConfig, createTSlatePlugin } from '@udecode/plate';
import { WebrtcProvider as YWebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import type { WithYjsOptions } from './withTYjs';

import { withPlateYjs } from './withPlateYjs';

export interface UnifiedProvider {
  awareness: Awareness;
  connect: () => void;
  destroy: () => void;
  disconnect: () => void;
  getDocument: () => Y.Doc;
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
    /**
     * HocuspocusProvider configuration
     * Required if providerType is 'hocuspocus'
     */
    hocuspocusProviderOptions?: HocuspocusProviderConfiguration;
    /** Provider type - defaults to hocuspocus for backward compatibility */
    providerType?: YjsProviderType;
    /**
     * WebRTC provider configuration
     * Required if providerType is 'webrtc'
     */
    webrtcProviderOptions?: WebRTCProviderOptions;
    /** WithYjs options */
    yjsOptions?: WithYjsOptions;
  }
>;

export type YjsProviderType = 'hocuspocus' | 'webrtc';

class HocuspocusProviderWrapper implements UnifiedProvider {
  destroy = () => this.provider.disconnect();
  disconnect = () => this.provider.disconnect();

  getDocument = () => this.provider.document;
  constructor(private provider: HocuspocusProvider) {}
  connect() {
    void this.provider.connect();
  }
  get awareness() { return this.provider.awareness!; }
}

class WebRTCProviderWrapper implements UnifiedProvider {
  connect = () => { this.provider.connect(); }  
  destroy = () => this.provider.destroy();
  disconnect = () => { this.provider.disconnect(); }
  getDocument = () => this.provider.doc;
  constructor(private provider: WebrtcProvider) {}
  get awareness() { return this.provider.awareness; }
}

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: 'yjs',
  extendEditor: withPlateYjs,
  options: {
    isConnected: false,
    isSynced: false,
    provider: {} as any,
  },
}).extend(({ getOptions, setOption }) => {
  const { hocuspocusProviderOptions, providerType = 'hocuspocus', webrtcProviderOptions } = getOptions();

  if (providerType === 'hocuspocus' && !hocuspocusProviderOptions) {
    throw new Error('HocuspocusProvider configuration is required when using hocuspocus provider');
  }

  if (providerType === 'webrtc' && !webrtcProviderOptions) {
    throw new Error('WebRTC provider configuration is required when using webrtc provider');
  }

  let provider: UnifiedProvider;

  if (providerType === 'webrtc') {
    const webrtcProvider = new YWebrtcProvider(
      webrtcProviderOptions!.roomName,
      new Y.Doc(),
      {
        filterBcConns: webrtcProviderOptions!.filterBcConns,
        maxConns: webrtcProviderOptions!.maxConns,
        password: webrtcProviderOptions!.password,
        peerOpts: webrtcProviderOptions!.peerOpts,
        signaling: webrtcProviderOptions!.signaling,
      }
    );

    provider = new WebRTCProviderWrapper(webrtcProvider);

    // Set connection status
     webrtcProvider.on('status', (status) => {
       if (status.connected) {
         setOption('isConnected', true);
         setOption('isSynced', true); 
       } else {
         setOption('isConnected', false);
         setOption('isSynced', false);
       }
     });

     webrtcProvider.on('synced', (synced) => {
       setOption('isSynced', synced.synced);
     });
  } else {
    const hocusProvider = new HocuspocusProvider({
      ...hocuspocusProviderOptions!,
      onAwarenessChange() {},
      onConnect() {
        setOption('isConnected', true);
        hocuspocusProviderOptions!.onConnect?.();
      },
      onDisconnect(data) {
        setOption('isConnected', false);
        setOption('isSynced', false);
        hocuspocusProviderOptions!.onDisconnect?.(data);
      },
      onSynced(data) {
        setOption('isSynced', true);
        hocuspocusProviderOptions!.onSynced?.(data);
      },
    });

    provider = new HocuspocusProviderWrapper(hocusProvider);
  }

  return {
    options: { provider },
  };
});
