import { detect } from '@antfu/ni';

/**
 * This script uses `@antfu/ni` to automatically detect the package manager used
 * in the current project (yarn, pnpm, or npm).
 */
export async function getPackageManager(
  targetDir: string
): Promise<'bun' | 'npm' | 'pnpm' | 'yarn'> {
  const packageManager = await detect({ cwd: targetDir, programmatic: true });

  if (packageManager === 'yarn@berry') return 'yarn';
  if (packageManager === 'pnpm@6') return 'pnpm';
  if (packageManager === 'bun') return 'bun';

  return packageManager ?? 'npm';
}
