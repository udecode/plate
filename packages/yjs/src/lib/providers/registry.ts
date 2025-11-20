import type {
  ProviderConstructor,
  ProviderConstructorProps,
  ProviderRegistry,
  YjsProviderType,
} from './types';

import { HocuspocusProviderWrapper } from './hocuspocus-provider';
import { WebRTCProviderWrapper } from './webrtc-provider';

// Provider registry for extensibility
const providerRegistry: ProviderRegistry = {
  hocuspocus: HocuspocusProviderWrapper,
  webrtc: WebRTCProviderWrapper,
};

// Register a new provider type
export const registerProviderType = <T>(
  type: string,
  providerClass: ProviderConstructor<T>
) => {
  providerRegistry[type as YjsProviderType] =
    providerClass as ProviderConstructor;
};

// Get a provider constructor by type
export const getProviderClass = (
  type: YjsProviderType
): ProviderConstructor | undefined => providerRegistry[type];

// Create a provider instance
export const createProvider = ({
  type,
  ...props
}: ProviderConstructorProps & {
  type: YjsProviderType;
}) => {
  const ProviderClass = getProviderClass(type);

  if (!ProviderClass) {
    throw new Error(`Provider type "${type}" not found in registry`);
  }

  return new ProviderClass(props);
};
