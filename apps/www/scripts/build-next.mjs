import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const heapLimit = process.env.PLATE_BUILD_BASIC === '0' ? 8192 : 4096;
console.log(`Next.js build heap limit: ${heapLimit} MiB`);
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('next/dist/bin/next')),
    'build',
    ...process.argv.slice(2),
  ],
  {
    env: {
      ...process.env,
      // Next reformats inherited flags for workers, so both spellings must agree.
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=${heapLimit} --max_old_space_size=${heapLimit}`,
    },
    stdio: 'inherit',
  }
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
