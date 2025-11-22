import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { afterEach, expect, mock, spyOn } from 'bun:test';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { TextEncoder } from 'node:util';

// Make mock and spyOn globally available to avoid needing to import from bun:test
(globalThis as any).mock = mock;
(globalThis as any).spyOn = spyOn;

// Register DOM globals FIRST - this must happen before any code that uses document/window
GlobalRegistrator.register();

// Ensure document.body exists
if (global.document && !global.document.body) {
  const body = global.document.createElement('body');
  global.document.documentElement.appendChild(body);
}

// Explicitly set DOMParser globally for module scope
// Some built modules reference DOMParser directly without window prefix
if (typeof window !== 'undefined' && window.DOMParser) {
  // Force DOMParser to be globally available
  Object.defineProperty(globalThis, 'DOMParser', {
    value: window.DOMParser,
    writable: true,
    configurable: true,
  });
}

// Fix Happy-DOM readonly property issue with isContentEditable
// slate-test-utils needs to set element.isContentEditable = true
// but Happy-DOM makes this property readonly
if (typeof window !== 'undefined' && window.HTMLElement) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window.HTMLElement.prototype,
    'isContentEditable'
  );

  Object.defineProperty(window.HTMLElement.prototype, 'isContentEditable', {
    configurable: true,
    enumerable: true,
    get() {
      // Check if we have a custom value set
      const customValue = (this as any)._customIsContentEditable;
      if (customValue !== undefined) {
        return customValue;
      }
      // Fall back to original behavior
      return originalDescriptor?.get?.call(this) ?? false;
    },
    set(value: boolean) {
      // Store custom value
      (this as any)._customIsContentEditable = value;
    },
  });
}

// Extend Bun's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test - removes rendered React components
afterEach(() => {
  cleanup();
});

// TextEncoder global (for Node compatibility)
global.TextEncoder = TextEncoder as any;

// Mock MessageChannel (Bun compatible)
global.MessageChannel = class MessageChannel {
  port1 = {
    addEventListener: () => {},
    close: () => {},
    postMessage: () => {},
    removeEventListener: () => {},
    start: () => {},
  };
  port2 = {
    addEventListener: () => {},
    close: () => {},
    postMessage: () => {},
    removeEventListener: () => {},
    start: () => {},
  };
} as any;
