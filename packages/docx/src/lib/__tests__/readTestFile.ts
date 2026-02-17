import fs from 'node:fs';
import path from 'node:path';

export const readTestFile = (filepath: string): string => {
  const absoluteFilepath = path.resolve(import.meta.dirname, filepath);

  return fs.readFileSync(absoluteFilepath, 'utf8');
};
