import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import type { ProviderConstructor, ProviderEventHandlers, ProviderRegistry, YjsProviderType } from './types';

import { HocuspocusProviderWrapper } from './hocuspocus-provider';
import { WebRTCProviderWrapper } from './webrtc-provider';

// Provider registry for extensibility
const providerRegistry: ProviderRegistry = {
  'hocuspocus': HocuspocusProviderWrapper,
  'webrtc': WebRTCProviderWrapper,
};

// Register a new provider type
export const registerProviderType = <T>(
  type: string, 
  providerClass: new (options: T, handlers: ProviderEventHandlers, existingDoc?: Y.Doc) => any
) => {
  providerRegistry[type as YjsProviderType] = providerClass as ProviderConstructor;
};

// Get a provider constructor by type
export const getProviderClass = (type: YjsProviderType): ProviderConstructor | undefined => {
  return providerRegistry[type];
};

// Create a provider instance
export const createProvider = (
  type: YjsProviderType,
  options: any,
  handlers: ProviderEventHandlers,
  existingDoc?: Y.Doc,
  sharedAwareness?: Awareness
) => {
  const ProviderClass = getProviderClass(type);
  
  if (!ProviderClass) {
    throw new Error(`Provider type "${type}" not found in registry`);
  }
  
  return new ProviderClass(options, handlers, existingDoc, sharedAwareness);
}; 