import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [bundlePath, resultPath] = process.argv.slice(2);

if (!bundlePath || !resultPath) {
  throw new Error('Plate evaluation worker requires bundle and result paths.');
}

try {
  const editorModule = await import(pathToFileURL(bundlePath).href);
  const editor = editorModule.default;

  writeFileSync(resultPath, JSON.stringify(editor));
  process.exit(0);
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
}
