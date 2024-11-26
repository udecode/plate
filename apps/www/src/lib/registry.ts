import type { z } from 'zod';

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type SourceFile, Project, ScriptKind, SyntaxKind } from 'ts-morph';

import { Index } from '../__registry__';
import {
  type registryItemFileSchema,
  registryItemSchema,
} from '../registry/schema';
import { fixImport } from './rehype-utils';

const memoizedIndex: typeof Index = Object.fromEntries(
  Object.entries(Index).map(([style, items]) => [style, { ...items }])
);

export function getRegistryComponent(name: string) {
  return memoizedIndex.default[name]?.component;
}

export async function getRegistryItem(name: string, prefetch = false) {
  const item = memoizedIndex.default[name];

  if (!item) {
    return null;
  }

  // Convert all file paths to object.
  // TODO: remove when we migrate to new registry.
  item.files = item.files.map((file: unknown) =>
    typeof file === 'string' ? { path: file } : file
  );

  // Fail early before doing expensive file operations.
  const result = registryItemSchema.safeParse(item);

  if (!result.success) {
    return null;
  }

  let files: typeof result.data.files = [];
  const seen = new Set<string>();

  // Get all files including dependencies
  const allFiles = await getAllItemFiles(name, seen);

  for (const file of allFiles) {
    const relativePath = path.relative(process.cwd(), file.path);

    const content =
      !prefetch || file.path === item.files[0].path
        ? await getFileContent(file.path)
        : undefined;

    files.push({
      ...file,
      content,
      path: relativePath,
    } as any);
  }

  // Get meta.
  // Assume the first file is the main file.
  const meta = await getFileMeta(files[0].path);

  // Fix file paths.
  files = fixFilePaths(files);

  const parsed = registryItemSchema.safeParse({
    ...result.data,
    files,
    meta,
  });

  if (!parsed.success) {
    console.error(parsed.error.message);

    return null;
  }

  return parsed.data;
}

// New helper function to get all files including dependencies
async function getAllItemFiles(
  name: string,
  seen = new Set<string>()
): Promise<{ path: string }[]> {
  if (seen.has(name)) return [];

  seen.add(name);

  const item = memoizedIndex.default[name];

  if (!item) return [];

  let allFiles = [...(item.files ?? [])].map((file) =>
    typeof file === 'string' ? { path: file } : file
  );

  // Recursively get files from dependencies
  if (item.registryDependencies) {
    for (const dep of item.registryDependencies) {
      const depFiles = await getAllItemFiles(dep, seen);
      allFiles = [...allFiles, ...depFiles];
    }
  }

  // Remove duplicates based on path
  const uniqueFiles = Array.from(
    new Map(allFiles.map((file) => [file.path, file])).values()
  );

  return uniqueFiles;
}

async function getFileContent(filePath: string) {
  const raw = await fs.readFile(path.join(process.cwd(), filePath), 'utf8');

  const project = new Project({
    compilerOptions: {},
  });

  const tempFile = await createTempSourceFile(filePath);
  const sourceFile = project.createSourceFile(tempFile, raw, {
    scriptKind: ScriptKind.TSX,
  });

  // Remove meta variables.
  removeVariable(sourceFile, 'iframeHeight');
  removeVariable(sourceFile, 'containerClassName');
  removeVariable(sourceFile, 'description');
  removeVariable(sourceFile, 'descriptionSrc');

  let code = sourceFile.getFullText();

  // FORK: not useful?
  // Format the code.
  // code = code.replaceAll('export default', 'export');

  // Fix imports.
  code = fixImport(code);

  return code;
}

async function getFileMeta(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8');

  const project = new Project({
    compilerOptions: {},
  });

  const tempFile = await createTempSourceFile(filePath);
  const sourceFile = project.createSourceFile(tempFile, raw, {
    scriptKind: ScriptKind.TSX,
  });

  const iframeHeight = extractVariable(sourceFile, 'iframeHeight');
  const containerClassName = extractVariable(sourceFile, 'containerClassName');
  const description = extractVariable(sourceFile, 'description');
  const descriptionSrc = extractVariable(sourceFile, 'descriptionSrc');

  return {
    containerClassName,
    description,
    descriptionSrc,
    iframeHeight,
  };
}

function getFileTarget(file: z.infer<typeof registryItemFileSchema>) {
  let target = file.target;

  if (!target || target === '') {
    const fileName = file.path.split('/').pop();

    if (file.type === 'registry:component') {
      target = file.path.replace('src/registry/default/', '');
    }
    if (file.type === 'registry:block' || file.type === 'registry:example') {
      target = `components/${fileName}`;
    }
    if (file.type === 'registry:ui') {
      target = `components/plate-ui/${fileName}`;
    }
    if (file.type === 'registry:hook') {
      target = `hooks/${fileName}`;
    }
    if (file.type === 'registry:lib') {
      target = `lib/${fileName}`;
    }
  }

  return target;
}

async function createTempSourceFile(filename: string) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'shadcn-'));

  return path.join(dir, filename);
}

function removeVariable(sourceFile: SourceFile, name: string) {
  sourceFile.getVariableDeclaration(name)?.remove();
}

function extractVariable(sourceFile: SourceFile, name: string) {
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

function fixFilePaths(files: z.infer<typeof registryItemSchema>['files']) {
  if (!files) {
    return [];
  }

  // Resolve all paths relative to the first file's directory.
  const firstFilePath = files[0].path;
  const firstFilePathDir = path.dirname(firstFilePath);

  return files.map((file) => {
    return {
      ...file,
      path: path.relative(firstFilePathDir, file.path),
      target: getFileTarget(file),
    };
  });
}

export type FileTree = {
  name: string;
  children?: FileTree[];
  path?: string;
};

export function createFileTreeForRegistryItemFiles(
  files?: { path: string; target?: string }[]
) {
  if (!files) {
    return null;
  }

  const root: FileTree[] = [];

  for (const file of files) {
    const path = file.target ?? file.path;
    const parts = path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        if (isFile) {
          // Update existing file node with full path
          existingNode.path = path;
        } else {
          // Move to next level in the tree
          currentLevel = existingNode.children!;
        }
      } else {
        const newNode: FileTree = isFile
          ? { name: part, path }
          : { children: [], name: part };

        currentLevel.push(newNode);

        if (!isFile) {
          currentLevel = newNode.children!;
        }
      }
    }
  }

  return root;
}
