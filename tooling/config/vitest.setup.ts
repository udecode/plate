import { TextEncoder } from 'node:util';
// @ts-expect-error vitest to install
import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';
import 'slate-test-utils/dist/cjs/mocks';

window.MessageChannel = vi.fn().mockImplementation(() => {
  return {
    port1: {
      addEventListener: vi.fn(),
      close: vi.fn(),
      postMessage: vi.fn(),
      removeEventListener: vi.fn(),
      start: vi.fn(),
    },
    port2: {
      addEventListener: vi.fn(),
      close: vi.fn(),
      postMessage: vi.fn(),
      removeEventListener: vi.fn(),
      start: vi.fn(),
    },
  };
});

global.TextEncoder = TextEncoder;

vi.spyOn(global.console, 'warn').mockImplementation(() => vi.fn());
vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());

let id = 1;

vi.mock('nanoid', () => ({
  nanoid: () => `${id++}`,
}));

// vi.mock('@udecode/plate-core', () => ({
//   __esModule: true,
//   ...(await vi.importActual('@udecode/plate-core')),
// }));

// Add mock for lucide-react
vi.mock('lucide-react', () => {
  return new Proxy(
    {
      __esModule: true,
    },
    {
      get: function (_, prop) {
        if (prop === '__esModule') return true;

        // Return a mock component for any icon request
        return function MockIcon() {
          return null;
        };
      },
    }
  );
});
