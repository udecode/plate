import type { UnistNode } from '@/types/unist';
import type { Registry } from 'shadcn/registry';

import path from 'node:path';

import registryShadcnData from '../../registry-shadcn.json';
import { registry } from '../registry/registry';

const registryShadcn = registryShadcnData as unknown as Registry;

export function fixImport(content: string) {
  const regex =
    /@\/(.+?)\/((?:.*?\/)?(?:components|ui|hooks|lib|example))\/([\w-]+)/g;

  const replacement = (
    match: string,
    path: string,
    type: string,
    component: string
  ) => {
    if (type.endsWith('components') || type.endsWith('example')) {
      return `@/components/${component}`;
    } else if (type.endsWith('ui')) {
      return `@/components/ui/${component}`;
    } else if (type.endsWith('hooks')) {
      return `@/hooks/${component}`;
    } else if (type.endsWith('lib')) {
      return `@/lib/${component}`;
    }

    return match;
  };

  return content.replaceAll(regex, replacement);
}

export function getNodeAttributeByName(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name);
}

// export function getComponentSourceFileContent(node: UnistNode) {
//   const src = getNodeAttributeByName(node, 'src')?.value as string;

//   if (!src) {
//     return '';
//   }

//   // Read the source file.
//   const filePath = path.join(process.cwd(), src);
//   let source = fs.readFileSync(filePath, 'utf8');

//   source = fixImport(source);

//   return source;
// }

export function getAllFiles(
  name: string,
  seen = new Set<string>(),
  isShadcn?: boolean
) {
  const registryTarget = isShadcn ? registryShadcn : registry;

  if (seen.has(name)) return [];

  seen.add(name);

  const component: any = registryTarget.items.find((c) => c.name === name);

  if (!component) {
    throw new Error(`File ${name} not found`);
  }

  const files: string[] = [
    ...(component.files ?? []),
    ...(component.registryDependencies ?? []).flatMap((dep: any) => {
      const isDependencyShadcn = dep.includes('shadcn/');

      return getAllFiles(
        isDependencyShadcn ? dep.split('shadcn/')[1] : dep,
        seen,
        isShadcn || isDependencyShadcn
      ).filter(Boolean);
    }),
  ];

  const uniqueFiles = Array.from(new Set(files));

  return processFiles(uniqueFiles);
}

function processFiles(files: ({ path: string; file?: string } | string)[]): {
  file: string;
  language: string;
  name: string;
  type: string;
}[] {
  return files.map((fileOrObj) => {
    const file =
      typeof fileOrObj === 'string'
        ? fileOrObj
        : (fileOrObj.path ?? fileOrObj.file);

    return {
      file,
      language: path.extname(file).slice(1),
      name: path.basename(file),
      type: getFileType(file),
    };
  });
}

function getFileType(file: string): string {
  if (file.includes('components/')) {
    return 'components';
  } else if (file.includes('ui/')) {
    return 'ui';
  } else if (file.includes('hooks/')) {
    return 'hooks';
  } else if (file.includes('lib/')) {
    return 'lib';
  } else if (file.includes('example/')) {
    return 'example';
  }

  return 'unknown';
}

export function getAllDependencies(
  name: string,
  seen = new Set<string>(),
  isShadcn?: boolean
): string[] {
  const registryTarget = isShadcn ? registryShadcn : registry;

  if (seen.has(name)) return [];

  seen.add(name);

  const component = registryTarget.items.find((c) => c.name === name);

  if (!component) {
    console.log(registryTarget.items);
    throw new Error(`Dependency ${name} not found`);
  }

  const deps = [
    ...(component.dependencies ?? []),
    ...(component.registryDependencies ?? []).flatMap((dep) => {
      const isDependencyShadcn = dep.includes('shadcn/');

      return getAllDependencies(
        isDependencyShadcn ? dep.split('shadcn/')[1] : dep,
        seen,
        isShadcn || isDependencyShadcn
      );
    }),
  ];

  return Array.from(new Set(deps));
}
// function processFiles(
//   files: ({ path: string } | string)[],
//   styleName: string
// ): {
//   code: string;
//   file: string;
//   language: string;
//   name: string;
//   type: string;
// }[] {
//   return files
//     .map((fileOrObj) => {
//       const file = typeof fileOrObj === 'string' ? fileOrObj : fileOrObj.path;

//       const filePath = path.join(
//         process.cwd(),
//         'src/registry',
//         styleName,
//         file
//       );
//       let source: string;

//       try {
//         source = fs.readFileSync(filePath, 'utf8');
//       } catch (error) {
//         console.error(`Error reading file ${filePath}:`, error);

//         return null;
//       }

//       source = fixImport(source);

//       return {
//         code: source,
//         file,
//         language: path.extname(file).slice(1),
//         name: path.basename(file),
//         type: getFileType(file),
//       };
//     })
//     .filter(Boolean) as any;
// }
