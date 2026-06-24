import { type ConsoleMessage, expect, type Page } from '@playwright/test';

const DEFAULT_RUNTIME_ERROR_PATTERNS = [
  'Unable to find the path for Plite node',
  'Cannot resolve a Plite node',
  'Cannot resolve a DOM point',
  'Cannot resolve a DOM range',
];

const NEXT_DATA_ACCESS_CONTROL_ERROR =
  /Fetch API cannot load http:\/\/(?:localhost|127\.0\.0\.1):\d+\/_next\/data\//;

/** Recorder returned by runtime-error capture helpers. */
export type PliteBrowserRuntimeErrorRecorder = {
  assertNone: () => void;
  errors: string[];
  stop: () => void;
};

const isIgnoredRuntimeError = (text: string) =>
  (NEXT_DATA_ACCESS_CONTROL_ERROR.test(text) &&
    text.includes('due to access control checks.')) ||
  (text.includes("Permission policy 'Fullscreen' check failed") &&
    text.includes('https://player.vimeo.com')) ||
  (text.includes('error loading dynamically imported module') &&
    text.includes('https://player.vimeo.com'));

/** Start recording browser runtime errors for a Playwright page. */
export const recordPliteBrowserRuntimeErrors = (
  page: Page,
  options: {
    patterns?: readonly string[];
  } = {}
): PliteBrowserRuntimeErrorRecorder => {
  const patterns = options.patterns ?? DEFAULT_RUNTIME_ERROR_PATTERNS;
  const errors: string[] = [];
  const onPageError = (error: Error) => {
    const text = error.stack ?? error.message;

    if (!isIgnoredRuntimeError(text)) {
      errors.push(text);
    }
  };
  const onConsole = (message: ConsoleMessage) => {
    const text = message.text();

    if (isIgnoredRuntimeError(text)) {
      return;
    }

    if (
      message.type() === 'error' &&
      patterns.some((pattern) => text.includes(pattern))
    ) {
      errors.push(text);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  return {
    assertNone: () => expect(errors).toEqual([]),
    errors,
    stop: () => {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
    },
  };
};
