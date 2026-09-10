import type { expect } from 'bun:test';

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Registered at runtime by the shared Bun DOM test setup.
declare module 'bun:test' {
  interface Matchers<T = unknown> extends TestingLibraryMatchers<
    ReturnType<typeof expect.stringContaining>,
    void
  > {}
}
