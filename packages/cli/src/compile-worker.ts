import { writeFileSync } from 'node:fs';

import { compileEditorInProcess } from './generate';

const [entry, cwd, resultPath] = process.argv.slice(2);

if (!entry || !cwd || !resultPath) {
  throw new Error('Plate codegen worker requires entry, cwd, and result path.');
}

try {
  const compiled = await compileEditorInProcess(entry, { cwd });

  writeFileSync(resultPath, JSON.stringify(compiled));
  process.exit(0);
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
}
