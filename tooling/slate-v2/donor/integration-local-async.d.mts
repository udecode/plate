export type PlaywrightFailure = {
  file: string;
  line: number | null;
  message: string;
  project: string;
  status: string;
  title: string;
};

export function commandKeyFor(command: readonly string[]): string;

export function buildPlaywrightCommand(
  extraPlaywrightArgs: readonly string[],
  additionalPlaywrightArgs?: readonly string[]
): string[];

export function buildSlateBrowserBuildCommand(): string[];

export function extractFailuresFromPlaywrightReport(
  report: unknown
): PlaywrightFailure[];

export function findAvailablePort(startPort?: number): Promise<number>;

export function getRunReuseDecision(input: {
  live: boolean;
  requestedCommandKey: string;
  requestedSourceStamp: string;
  status?: {
    command?: readonly string[];
    commandKey?: string;
    runId?: string;
    sourceStamp?: string;
    status: string;
  } | null;
}): {
  reason: string;
  reuse: boolean;
};

export function renderFailuresMarkdown(input: {
  exitCode: number;
  fallbackText?: string;
  failures: readonly PlaywrightFailure[];
  parseError?: string;
  runId: string;
}): string;

export function renderPickupMarkdown(input: {
  failuresText?: string;
  status: {
    command?: readonly string[];
    completedAt?: string;
    cwd?: string;
    exitCode?: number;
    failureCount?: number;
    failuresPath?: string;
    phase?: string;
    rawLogPath?: string;
    runId: string;
    startedAt?: string;
    status: string;
  };
}): string;

export function splitPlaywrightArgs(args: readonly string[]): {
  passthrough: string[];
  targets: string[];
};
