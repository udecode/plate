// biome-ignore-all lint/style/noNamespace: Global JSX augmentation requires the JSX namespace.
import { jsx as baseJsx } from '../src';

export const jsx = baseJsx;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
