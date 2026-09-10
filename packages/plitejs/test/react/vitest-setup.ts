import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, expect } from 'vitest';

expect.extend(matchers);

Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
  writable: true,
});

afterEach(() => {
  cleanup();
});
