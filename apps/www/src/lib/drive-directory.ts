import { execFileSync } from 'node:child_process';
import path from 'node:path';

let repositoryRoot: string | undefined;

export function driveDirectory() {
  const dir = process.env.PLATE_WWW_DRIVE_DIR;
  if (!dir || process.env.NODE_ENV !== 'development') return null;

  repositoryRoot ??= execFileSync(
    'git',
    ['--no-optional-locks', 'rev-parse', '--show-toplevel'],
    { cwd: process.cwd(), encoding: 'utf-8' }
  ).trim();

  return path.resolve(repositoryRoot, dir);
}
