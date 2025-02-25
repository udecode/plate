import { TextEncoder } from 'node:util';

import '@testing-library/jest-dom';
import 'slate-test-utils/dist/cjs/mocks';

window.MessageChannel = jest.fn().mockImplementation(() => {
  return {
    port1: {
      addEventListener: jest.fn(),
      close: jest.fn(),
      postMessage: jest.fn(),
      removeEventListener: jest.fn(),
      start: jest.fn(),
    },
    port2: {
      addEventListener: jest.fn(),
      close: jest.fn(),
      postMessage: jest.fn(),
      removeEventListener: jest.fn(),
      start: jest.fn(),
    },
  };
});

global.TextEncoder = TextEncoder;

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

let id = 1;

jest.mock('nanoid', () => ({
  nanoid: () => `nanoid-${id++}`,
}));

jest.mock('@udecode/plate-core', () => ({
  __esModule: true,
  ...jest.requireActual('@udecode/plate-core'),
}));

// Add mock for lucide-react
jest.mock('lucide-react', () => {
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
