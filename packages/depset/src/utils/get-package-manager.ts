import { detect } from '@antfu/ni';

export type PackageManager = 'bun' | 'npm' | 'pnpm' | 'yarn';

export async function getPackageManager(
  targetDir: string,
  {
    programmatic = true, // ni specific
    withFallback = true,
  }: { programmatic?: boolean; withFallback?: boolean } = {}
): Promise<PackageManager> {
  const detected = await detect({ cwd: targetDir, programmatic });

  if (detected) {
    if (detected.startsWith('yarn')) return 'yarn'; // Catches yarn and yarn@berry
    if (detected.startsWith('pnpm')) return 'pnpm'; // Catches pnpm and pnpm@version
    if (detected === 'bun') return 'bun';
    if (detected === 'npm') return 'npm';
  }

  if (withFallback) {
    // Fallback to user agent if not detected.
    const userAgent = process.env.npm_config_user_agent || '';

    if (userAgent.startsWith('yarn')) {
      return 'yarn';
    }
    if (userAgent.startsWith('pnpm')) {
      return 'pnpm';
    }
    if (userAgent.startsWith('bun')) {
      return 'bun';
    }
  }

  return 'npm'; // Default or if no fallback matched
}
