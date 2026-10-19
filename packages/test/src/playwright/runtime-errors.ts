import { type ConsoleMessage, expect, type Page } from '@playwright/test';

/** The console error texts `recordBrowserRuntimeErrors` records by default. */
export const DEFAULT_RUNTIME_ERROR_PATTERNS: readonly string[] = [
  'Unable to find the path for an editor node',
  'Cannot resolve an editor node',
  'Cannot resolve a DOM ',
];

const NEXT_DATA_ACCESS_CONTROL_ERROR =
  /Fetch API cannot load http:\/\/(?:localhost|127\.0\.0\.1):\d+\/_next\/data\//;
const URL_PATTERN = /https?:\/\/[^\s)'"]+/g;

/** Recorder returned by runtime-error capture helpers. */
export type BrowserRuntimeErrorRecorder = {
  assertNone: () => void;
  errors: string[];
  reset: () => void;
  stop: () => void;
};

const getOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

const isThirdPartyError = (text: string, pageOrigin: string | null) => {
  const origins = Array.from(text.matchAll(URL_PATTERN), ([url]) =>
    getOrigin(url)
  );

  return (
    pageOrigin !== null &&
    origins.length > 0 &&
    origins.every((origin) => origin !== null && origin !== pageOrigin)
  );
};

// Browsers log a failed resource load without its URL, which only the console
// location names.
const getConsoleText = (message: ConsoleMessage) => {
  const text = message.text();

  return text.startsWith('Failed to load resource')
    ? `${text} (${message.location().url})`
    : text;
};

const isIgnoredRuntimeError = (text: string, pageOrigin: string | null) =>
  (NEXT_DATA_ACCESS_CONTROL_ERROR.test(text) &&
    text.includes('due to access control checks.')) ||
  isThirdPartyError(text, pageOrigin);

/** Start recording browser runtime errors for a Playwright page. */
export const recordBrowserRuntimeErrors = (
  page: Page,
  options: {
    patterns?: readonly string[];
    /** Capture every console/page error, including otherwise ignored errors. */
    strict?: boolean;
  } = {}
): BrowserRuntimeErrorRecorder => {
  const patterns = options.patterns ?? DEFAULT_RUNTIME_ERROR_PATTERNS;
  const errors: string[] = [];
  const isIgnored = (text: string) =>
    !options.strict && isIgnoredRuntimeError(text, getOrigin(page.url()));
  const onPageError = (error: Error) => {
    const text = error.stack ?? error.message;

    if (!isIgnored(text)) {
      errors.push(text);
    }
  };
  const onConsole = (message: ConsoleMessage) => {
    const text = getConsoleText(message);

    if (isIgnored(text)) {
      return;
    }

    if (
      message.type() === 'error' &&
      (options.strict || patterns.some((pattern) => text.includes(pattern)))
    ) {
      errors.push(text);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  return {
    assertNone: () => expect(errors).toEqual([]),
    errors,
    reset: () => {
      errors.length = 0;
    },
    stop: () => {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
    },
  };
};
