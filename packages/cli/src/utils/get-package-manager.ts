import { detect } from '@antfu/ni';

/**
 * This script uses `@antfu/ni` to automatically detect the package manager used
 * in the current project (yarn, pnpm, or npm).
 */
export async function getPackageManager(
  targetDir: string
): Promise<'yarn' | 'pnpm' | 'bun' | 'npm'> {
  const packageManager = await detect({ programmatic: true, cwd: targetDir });

  if (packageManager === 'yarn@berry') return 'yarn';
  if (packageManager === 'pnpm@6') return 'pnpm';
  if (packageManager === 'bun') return 'bun';

  return packageManager ?? 'npm';
}
