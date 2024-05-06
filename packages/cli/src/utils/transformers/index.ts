import type { SourceFile } from 'ts-morph';
import type * as z from 'zod';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { Project, QuoteKind, ScriptKind } from 'ts-morph';

import type { Config } from '../get-config';
import type { registryBaseColorSchema } from '../registry/schema';

import { transformCssVars } from './transform-css-vars';
import { transformImport } from './transform-import';
import { transformRsc } from './transform-rsc';
import { transformTwPrefixes } from './transform-tw-prefix';

export type TransformOpts = {
  baseColor?: z.infer<typeof registryBaseColorSchema>;
  config: Config;
  filename: string;
  raw: string;
};

export type Transformer = (
  opts: {
    sourceFile: SourceFile;
  } & TransformOpts
) => Promise<SourceFile>;

const transformers: Transformer[] = [
  transformImport,
  transformRsc,
  transformCssVars,
  transformTwPrefixes,
];

const project = new Project({
  compilerOptions: {},
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
  },
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
    void transformer({ sourceFile, ...opts });
  }

  return sourceFile.getFullText();
}
