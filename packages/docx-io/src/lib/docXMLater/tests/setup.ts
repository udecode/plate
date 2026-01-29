/**
 * Jest Test Setup File
 * Configures the test environment and global utilities
 */

import { setGlobalLogger, SilentLogger } from '../src/utils/logger';

// Increase timeout for async operations
jest.setTimeout(30_000);

// Suppress library warnings during tests (set DOCXMLATER_LOG_LEVEL=warn to enable)
if (!process.env.DOCXMLATER_LOG_LEVEL) {
  setGlobalLogger(new SilentLogger());
}

// Global test utilities
beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Cleanup after each test if needed
});

// Clean up after all tests
afterAll(() => {
  // Ensure any async operations are cleaned up
  jest.clearAllTimers();
});
