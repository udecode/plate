import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [bundlePath, resultPath] = process.argv.slice(2);

if (!bundlePath || !resultPath) {
  throw new Error('Plate evaluation worker requires bundle and result paths.');
}

try {
  const definition = (await import(pathToFileURL(bundlePath).href)).default;

  writeFileSync(resultPath, JSON.stringify(definition));
  process.exit(0);
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
}
