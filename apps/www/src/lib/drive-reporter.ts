type DriveReporter = {
  sendOnceParsed: () => void;
};

declare global {
  interface Window {
    __driveReporter?: DriveReporter;
    __driveRendered?: number;
  }
}

// sendBeacon refuses a body over 64 KiB.
const MAX_ERRORS = 20;
const MAX_ERROR_LENGTH = 300;

function formatConsoleArgs(args: unknown[]) {
  const rest = args.slice(1);
  const text =
    typeof args[0] === 'string'
      ? args[0].replaceAll(/%[cdfioOs]/g, (token) => {
          if (rest.length === 0) return token;
          const arg = rest.shift();
          return token === '%c' ? '' : String(arg);
        })
      : String(args[0]);
  return [text, ...rest.map(String)].join(' ').split('\n')[0];
}

export function installDriveReporter() {
  if (window.__driveReporter) return window.__driveReporter;
  // React logs a page's render warnings before Next's router writes its URL,
  // so the path at log time can still name the previous page.
  const errors: string[] = [];
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  const send = () => {
    const reported = [...errors];
    if (entry && entry.responseStatus >= 400) {
      reported.unshift(`the server answered ${entry.responseStatus}`);
    }
    if (document.querySelector('.next-error-h1')) {
      reported.unshift('page not found');
    }
    navigator.sendBeacon(
      '/api/dev/drive',
      JSON.stringify({
        errors: reported,
        frame: window.top !== window,
        path: window.location.pathname,
        rendered: window.__driveRendered,
        sent: Date.now(),
        theme: document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light',
        webdriver: navigator.webdriver,
        width: window.innerWidth,
      })
    );
  };
  const sendOnceParsed = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', send, { once: true });
    } else {
      send();
    }
  };

  const keep = (message: string) => {
    const kept = message.slice(0, MAX_ERROR_LENGTH);
    if (errors.length >= MAX_ERRORS || errors.includes(kept)) return;
    errors.push(kept);
    send();
  };

  window.addEventListener('error', (event) => keep(event.message));
  window.addEventListener('unhandledrejection', (event) =>
    keep(String(event.reason))
  );
  const consoleError = console.error;
  console.error = (...args: unknown[]) => {
    const error = args.find((arg) => arg instanceof Error);
    keep(error ? error.message : formatConsoleArgs(args));
    consoleError.apply(console, args);
  };

  window.__driveReporter = { sendOnceParsed };
  if (entry && entry.responseStatus >= 400) send();
  return window.__driveReporter;
}
