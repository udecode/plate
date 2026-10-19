import { type BuildOptions, build as esbuildBuild, stop } from 'esbuild';

const STOPPED_SERVICE_PATTERN =
  /The service (?:was stopped|is no longer running)/;

/**
 * esbuild shares one service process per host process and never respawns it,
 * so once that child dies (a test runner's timeout cleanup, the OOM killer)
 * every later build would fail. Stopping resets the service so the retry
 * spawns a fresh one.
 */
export const build = async (options: BuildOptions) => {
  try {
    return await esbuildBuild(options);
  } catch (error) {
    if (
      !(error instanceof Error && STOPPED_SERVICE_PATTERN.test(error.message))
    ) {
      throw error;
    }
    await stop();

    return esbuildBuild(options);
  }
};
