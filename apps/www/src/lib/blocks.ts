'use server';

import type { Style } from '@/registry/registry-styles';

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type SourceFile, Project, ScriptKind, SyntaxKind } from 'ts-morph';
import { z } from 'zod';

import { Index } from '@/__registry__';
import { highlightCode } from '@/lib/highlight-code';
import {
  type BlockChunk,
  blockSchema,
  registryEntrySchema,
} from '@/registry/schema';

const DEFAULT_BLOCKS_STYLE = 'default' satisfies Style['name'];

const project = new Project({
  compilerOptions: {},
});

export async function getAllBlockIds(
  style: Style['name'] = DEFAULT_BLOCKS_STYLE
) {
  const blocks = await _getAllBlocks(style);

  return blocks.map((block) => block.name);
}

export async function getBlock(
  name: string,
  style: Style['name'] = DEFAULT_BLOCKS_STYLE
) {
  const entry = Index[style][name];

  const content = await _getBlockContent(name, style);

  const chunks = entry?.chunks
    ? await Promise.all(
        entry?.chunks?.map(async (chunk: BlockChunk) => {
          const code = await readFile(chunk.file);

          const tempFile = await createTempSourceFile(`${chunk.name}.tsx`);
          const sourceFile = project.createSourceFile(tempFile, code, {
            scriptKind: ScriptKind.TSX,
          });

          sourceFile
            .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
            .filter((node) => {
              return node.getAttribute('x-chunk') !== undefined;
            })
            ?.map((component) => {
              component
                .getAttribute('x-chunk')
                ?.asKind(SyntaxKind.JsxAttribute)
                ?.remove();
            });

          return {
            ...chunk,
            code: sourceFile
              .getText()
              .replaceAll(`@/registry/${style}/`, '@/components/'),
          };
        })
      )
    : [];

  const block = {
    highlightedCode: content.code ? await highlightCode(content.code) : '',
    style,
    ...entry,
    ...content,
    chunks,
    type: 'registry:block',
  };

  const result = blockSchema.safeParse(block);

  if (!result.success) {
    return null;
  }

  return result.data;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function _getAllBlocks(style: Style['name'] = DEFAULT_BLOCKS_STYLE) {
  const index = z.record(registryEntrySchema).parse(Index[style]);

  return Object.values(index).filter(
    (block) => block.type === 'registry:block'
  );
}

async function _getBlockCode(
  name: string,
  style: Style['name'] = DEFAULT_BLOCKS_STYLE
) {
  const entry = Index[style][name];

  if (!entry) {
    console.error(`Block ${name} not found in style ${style}`);

    return '';
  }

  const block = registryEntrySchema.parse(entry);

  if (!block.source) {
    return '';
  }

  return await readFile(block.source);
}

async function readFile(source: string) {
  const filepath = path.join(process.cwd(), source);

  return await fs.readFile(filepath, 'utf8');
}

async function createTempSourceFile(filename: string) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'codex-'));

  return path.join(dir, filename);
}

async function _getBlockContent(name: string, style: Style['name']) {
  const raw = await _getBlockCode(name, style);

  const tempFile = await createTempSourceFile(`${name}.tsx`);
  const sourceFile = project.createSourceFile(tempFile, raw, {
    scriptKind: ScriptKind.TSX,
  });

  // Extract meta.
  const iframeHeight = _extractVariable(sourceFile, 'iframeHeight');
  const containerClassName = _extractVariable(sourceFile, 'containerClassName');

  // Format the code.
  let code = sourceFile.getText();
  code = code.replaceAll(`@/registry/${style}/`, '@/components/');
  code = code.replaceAll('export default', 'export');

  return {
    code,
    container: {
      className: containerClassName,
      height: iframeHeight,
    },
  };
}

function _extractVariable(sourceFile: SourceFile, name: string) {
  const variable = sourceFile.getVariableDeclaration(name);

  if (!variable) {
    return null;
  }

  const value = variable
    .getInitializerIfKindOrThrow(SyntaxKind.StringLiteral)
    .getLiteralValue();

  variable.remove();

  return value;
}
