import type { UnistNode } from '@/types/unist';

import fs from 'node:fs';
import path from 'node:path';

import { Index } from '../__registry__/';
import { registry } from '../registry/registry';
import { examples } from '../registry/registry-examples';
import { styles } from '../registry/registry-styles';

export function fixImport(content: string) {
  const regex =
    /@\/(.+?)\/((?:.*?\/)?(?:components|plate-ui|hooks|lib|example))\/([\w-]+)/g;

  const replacement = (
    match: string,
    path: string,
    type: string,
    component: string
  ) => {
    if (type.endsWith('components')) {
      return `@/components/${component}`;
    } else if (type.endsWith('plate-ui')) {
      return `@/components/plate-ui/${component}`;
    } else if (type.endsWith('hooks')) {
      return `@/hooks/${component}`;
    } else if (type.endsWith('lib')) {
      return `@/lib/${component}`;
    } else if (type.endsWith('example')) {
      return `@/example/${component}`;
    }

    return match;
  };

  return content.replaceAll(regex, replacement);
}

function getFileType(file: string): string {
  if (file.includes('components/')) {
    return 'components';
  } else if (file.includes('plate-ui/')) {
    return 'plate-ui';
  } else if (file.includes('hooks/')) {
    return 'hooks';
  } else if (file.includes('lib/')) {
    return 'lib';
  } else if (file.includes('example/')) {
    return 'example';
  }

  return 'unknown';
}

export function getNodeAttributeByName(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name);
}

export function getComponentSourceFileContent(node: UnistNode) {
  const src = getNodeAttributeByName(node, 'src')?.value as string;

  if (!src) {
    return '';
  }

  // Read the source file.
  const filePath = path.join(process.cwd(), src);
  let source = fs.readFileSync(filePath, 'utf8');

  // source = source.replaceAll('@/registry/default/', '@/components/');
  // source = source.replaceAll('export default', 'export');
  source = fixImport(source);

  return source;
}

function processFiles(
  files: ({ path: string } | string)[],
  styleName: string
): {
  code: string;
  file: string;
  language: string;
  name: string;
  type: string;
}[] {
  return files
    .map((fileOrObj) => {
      const file = typeof fileOrObj === 'string' ? fileOrObj : fileOrObj.path;

      const filePath = path.join(
        process.cwd(),
        'src/registry',
        styleName,
        file
      );
      let source: string;

      try {
        source = fs.readFileSync(filePath, 'utf8');
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);

        return null;
      }

      source = fixImport(source);

      return {
        code: source,
        file,
        language: path.extname(file).slice(1),
        name: path.basename(file),
        type: getFileType(file),
      };
    })
    .filter(Boolean) as any;
}

export function getAllFiles(
  name: string,
  seen = new Set<string>()
): ReturnType<typeof processFiles> {
  if (seen.has(name)) return [];

  seen.add(name);

  const component: any = registry.find((c) => c.name === name);

  if (!component) {
    throw new Error(`File ${name} not found`);
  }

  let processedFiles: ReturnType<typeof processFiles> = [];

  for (const style of styles) {
    const styleComponent = Index[style.name][name];

    if (!styleComponent) {
      console.error(`Component ${name} not found in ${style.name}`);

      continue;
    }

    const files: string[] = [
      ...(component.files ?? []),
      ...(component.registryDependencies ?? []).flatMap((dep: any) =>
        getAllFiles(dep, seen).map((f) => f.file)
      ),
    ];

    const uniqueFiles = Array.from(new Set(files));

    const processedStyleFiles = processFiles(uniqueFiles, style.name);

    processedFiles = [...processedFiles, ...processedStyleFiles];
  }

  return processedFiles;
}

export function getExampleCode(name?: string) {
  if (!name) return null;

  const component = Index[styles[0].name][name];
  const example = examples.find((ex) => ex.name === name);

  if (!component || !example) {
    throw new Error(`Component ${name} not found`);
  }

  const files = processFiles(example.files as string[], styles[0].name);
  const dependencies = example.dependencies;

  return {
    dependencies,
    doc: { title: example.doc?.title },
    files,
    name: example.name,
  };
}

export function getAllDependencies(
  name: string,
  seen = new Set<string>()
): string[] {
  if (seen.has(name)) return [];

  seen.add(name);

  const component = registry.find((c) => c.name === name);

  if (!component) {
    throw new Error(`Dependency ${name} not found`);
  }

  const deps = [
    ...(component.dependencies ?? []),
    ...(component.registryDependencies ?? []).flatMap((dep) =>
      getAllDependencies(dep, seen)
    ),
  ];

  return Array.from(new Set(deps));
}
