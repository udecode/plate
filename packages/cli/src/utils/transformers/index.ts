import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { Project, ScriptKind, type SourceFile } from 'ts-morph';
import * as z from 'zod';

import { Config } from '../get-config';
import { registryBaseColorSchema } from '../registry/schema';
import { transformCssVars } from './transform-css-vars';
import { transformImport } from './transform-import';
import { transformRsc } from './transform-rsc';

export type TransformOpts = {
  filename: string;
  raw: string;
  config: Config;
  baseColor?: z.infer<typeof registryBaseColorSchema>;
};

export type Transformer = (
  opts: TransformOpts & {
    sourceFile: SourceFile;
  }
) => Promise<SourceFile>;

const transformers: Transformer[] = [
  transformImport,
  transformRsc,
  transformCssVars,
];

const project = new Project({
  compilerOptions: {},
});

async function createTempSourceFile(filename: string) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'plate-'));
  return path.join(dir, filename);
}

export async function transform(opts: TransformOpts) {
  const tempFile = await createTempSourceFile(opts.filename);
  const sourceFile = project.createSourceFile(tempFile, opts.raw, {
    scriptKind: ScriptKind.TSX,
  });

  for (const transformer of transformers) {
    transformer({ sourceFile, ...opts });
  }

  return sourceFile.getFullText();
}
