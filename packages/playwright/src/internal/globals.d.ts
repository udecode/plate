import type { TPlatePlaywrightAdapter } from './types';

declare global {
  interface Window {
    platePlaywrightAdapter?: TPlatePlaywrightAdapter;
  }
}
