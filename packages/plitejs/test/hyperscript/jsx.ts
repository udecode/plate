// Global JSX augmentation requires the JSX namespace.
import { jsx as baseJsx } from '../../src/hyperscript';

export const jsx = baseJsx;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
