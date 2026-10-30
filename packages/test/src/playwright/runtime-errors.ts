import { type ConsoleMessage, expect, type Page } from '@playwright/test';

/** The console error texts `recordBrowserRuntimeErrors` records by default. */
export const DEFAULT_RUNTIME_ERROR_PATTERNS: readonly string[] = [
  'Unable to find the path for an editor node',
  'Cannot resolve an editor node',
  'Cannot resolve a DOM ',
];

// WebKit raises a load it blocked for access control, and a response header it
// rejects on a load, as a page error, where Chromium and Firefox log them to
// the console. Playwright splits a stackless error's text at its first colon
// and drops the next character, which breaks a URL there, so the pattern takes
// any text in the URL's place.
const BROWSER_LOAD_ERROR =
  /^(?:(?:Fetch API|XMLHttpRequest) cannot load .+ due to access control checks\.|Invalid '[\w-]+' header encountered when loading )/;
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

const isIgnoredRuntimeError = (
  text: string,
  frames: string,
  pageOrigin: string | null
) => BROWSER_LOAD_ERROR.test(text) || isThirdPartyError(frames, pageOrigin);

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
  const isIgnored = (text: string, frames: string) =>
    !options.strict &&
    isIgnoredRuntimeError(text, frames, getOrigin(page.url()));
  // Playwright sets an empty stack on a page error that has no stack trace,
  // such as a WebKit promise rejection.
  const onPageError = ({ message, name, stack = '' }: Error) => {
    const text = stack || (name ? `${name}: ${message}` : message);

    if (!isIgnored(text, stack)) {
      errors.push(text);
    }
  };
  const onConsole = (message: ConsoleMessage) => {
    const text = getConsoleText(message);

    if (isIgnored(text, text)) {
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
