import { afterEach, expect, jest, mock, spyOn, vi } from 'bun:test';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import {
  ReadableStream,
  TextDecoderStream,
  TextEncoderStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';
import { TextEncoder, types } from 'node:util';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

// fumadocs' createMDX, which next.config.ts calls on import, regenerates
// apps/www/.source unless this is set, and other test files read that output.
process.env._FUMADOCS_MDX = '1';

const WWW_TSX = /[/\\]apps[/\\]www[/\\]src[/\\].*\.tsx$/;
const AUTOMATIC_JSX_PRAGMA_ON_FIRST_LINE = '/** @jsxRuntime automatic */ ';

Bun.plugin({
  name: 'www-automatic-jsx',
  setup(build) {
    build.onLoad({ filter: WWW_TSX }, async ({ path }) => {
      const source = await Bun.file(path).text();
      return {
        contents: source.includes('@jsx')
          ? source
          : AUTOMATIC_JSX_PRAGMA_ON_FIRST_LINE + source,
        loader: 'tsx',
      };
    });
  },
});

const moduleCache = createRequire(import.meta.url).cache;

const moduleExportNames = new Map<
  string,
  { fix: string; names: Set<string>; setBy: string }
>();

const shortPath = (path: string) => {
  const local = relative(process.cwd(), path);
  return local.startsWith('..') ? path : local;
};

const resolveMockTarget = (specifier: string, file: string) => {
  try {
    return Bun.resolveSync(specifier, dirname(file));
  } catch {
    return specifier.startsWith('.')
      ? resolve(dirname(file), specifier)
      : specifier;
  }
};

// A CommonJS module's namespace adds `default` to its exports object.
const loadedExportNames = (exports: object) =>
  types.isModuleNamespaceObject(exports)
    ? Object.keys(exports)
    : [...Object.keys(exports), 'default'];

const guardModuleMock =
  (register: typeof mock.module): typeof mock.module =>
  (specifier, factory) => {
    if (typeof factory !== 'function') return register(specifier, factory);
    const file = Bun.main;
    const path = resolveMockTarget(specifier, file);
    const loaded = moduleCache[path]?.exports;
    if (loaded && !moduleExportNames.has(path)) {
      moduleExportNames.set(path, {
        fix: 'Mock the module before anything in this process imports it, or drop those names.',
        names: new Set(loadedExportNames(loaded)),
        setBy: 'a real import',
      });
    }
    const check = (exports: unknown) => {
      if (
        exports === null ||
        (typeof exports !== 'object' && typeof exports !== 'function')
      ) {
        return exports;
      }
      const names = Object.keys(exports);
      const known = moduleExportNames.get(path);
      if (!known) {
        moduleExportNames.set(path, {
          fix: 'Run each module-mocking file in its own process, as `pnpm test` and the package `test` scripts do when given no paths, or give every mock of this module the same exports.',
          names: new Set(names),
          setBy: `the mock in ${shortPath(file)}`,
        });
        return exports;
      }
      const added = names.filter((name) => !known.names.has(name));
      if (added.length > 0) {
        throw new Error(
          `The mock of '${specifier}' in ${shortPath(file)} adds ${added.join(', ')}, but ${known.setBy} already set the exports of ${shortPath(path)} in this Bun process, and Bun cannot add exports to a loaded module, so they read as undefined. ${known.fix}`
        );
      }
      return exports;
    };
    return register(specifier, () => {
      const exports = factory();
      if (!types.isPromise(exports)) return check(exports);
      // Bun hangs the run when a loaded module's mock returns a promise that
      // settles after the factory's own, so check on a side chain instead.
      exports.then(check, () => {});
      return exports;
    });
  };

const guardedModuleMock = guardModuleMock(mock.module.bind(mock));

mock.module = guardedModuleMock;
vi.mock = guardedModuleMock;
// bun-types omits jest.mock, which Bun also ships as a module mock.
Object.assign(jest, { mock: guardedModuleMock });

// Make mock and spyOn globally available to avoid needing to import from bun:test
(globalThis as any).mock = mock;
(globalThis as any).spyOn = spyOn;

const VIMEO_UNAUTHORIZED_RE =
  /^GET https:\/\/player\.vimeo\.com\/video\/.+ 401/;

const shouldIgnoreHappyDomResourceError = (value: unknown): boolean => {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === 'string'
        ? value
        : null;

  if (!message) return false;

  return (
    VIMEO_UNAUTHORIZED_RE.test(message) ||
    (message.includes('Failed to load iframe page "') &&
      message.includes('Iframe page loading is disabled.')) ||
    (message.includes('Failed to load script "') &&
      message.includes('JavaScript file loading is disabled.'))
  );
};

const originalConsoleError = globalThis.console.error.bind(globalThis.console);
const originalConsoleWarn = globalThis.console.warn.bind(globalThis.console);

globalThis.console.error = (...args: unknown[]) => {
  if (args.some(shouldIgnoreHappyDomResourceError)) return;

  originalConsoleError(...args);
};

globalThis.console.warn = (...args: unknown[]) => {
  if (
    args.some(
      (value) =>
        typeof value === 'string' && value.startsWith('Unreachable code: ')
    )
  ) {
    return;
  }

  originalConsoleWarn(...args);
};

// Register DOM globals FIRST - this must happen before any code that uses document/window
GlobalRegistrator.register({
  settings: {
    disableJavaScriptFileLoading: true,
    handleDisabledFileLoadingAsSuccess: true,
    navigation: { disableChildFrameNavigation: true },
  },
});

// Parsers capture their stream superclass at import time, before any test-local setup.
Object.assign(globalThis, {
  ReadableStream,
  TextDecoderStream,
  TextEncoderStream,
  TransformStream,
  WritableStream,
});

if (global.document && !global.document.doctype) {
  const doctype = global.document.implementation.createDocumentType(
    'html',
    '',
    ''
  );

  global.document.insertBefore(doctype, global.document.documentElement);
}

if (global.document?.compatMode !== 'CSS1Compat') {
  Object.defineProperty(global.document, 'compatMode', {
    configurable: true,
    value: 'CSS1Compat',
  });
}

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

// Fix Happy-DOM readonly property issue with isContentEditable.
// Plate-owned test harnesses need to mark editable nodes as contentEditable,
// but Happy-DOM makes this property readonly.
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
      const customValue = this._customIsContentEditable;
      if (customValue !== undefined) {
        return customValue;
      }
      // Fall back to original behavior
      return originalDescriptor?.get?.call(this) ?? false;
    },
    set(value: boolean) {
      // Store custom value
      this._customIsContentEditable = value;
    },
  });
}

const matchers = await import('@testing-library/jest-dom/matchers');
const { cleanup } = await import('@testing-library/react');
const reactInternals = (
  (await import('react')) as unknown as Record<
    string,
    { actQueue?: unknown } | undefined
  >
).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

// Extend Bun's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test - removes rendered React components
afterEach(() => {
  cleanup();
  // An act() whose callback returns a promise stays open until it is awaited.
  // Left open, it keeps every later render in this process from flushing, so
  // the leaking test fails here instead of the files after it.
  if (reactInternals?.actQueue) {
    throw new Error(
      'This test left a React act() scope open: await act() when its callback returns a promise.'
    );
  }
});

// TextEncoder global (for Node compatibility)
global.TextEncoder = TextEncoder;

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
