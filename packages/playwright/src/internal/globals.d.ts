import type { TPlatePlaywrightAdapter } from './types';

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: Global Window augmentation must be an interface per TypeScript specification
  interface Window {
    platePlaywrightAdapter?: TPlatePlaywrightAdapter;
  }
}
