import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, expect } from 'vitest';

import { installBrowserHandle } from '../../src/react';

expect.extend(matchers);
// Trace contracts read the kernel trace without mounting an Editable.
installBrowserHandle();

Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
  writable: true,
});

afterEach(() => {
  cleanup();
});
