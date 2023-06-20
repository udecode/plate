import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

export const readTestFile = (filepath: string): string => {
  const absoluteFilepath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    filepath
  );
  return fs.readFileSync(absoluteFilepath, 'utf8');
};
