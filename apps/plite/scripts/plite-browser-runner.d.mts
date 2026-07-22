export declare const MAX_BROWSER_WORKERS: 8;

export declare const assertBrowserWorkerArgs: (
  args: readonly string[]
) => readonly string[];

export declare const resolvePliteBrowserBaseURL: (
  explicitBaseURL: string | undefined
) => string;

export declare const resolveBrowserWorkerCount: (
  value: unknown,
  name?: string
) => number;
