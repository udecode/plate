import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';

import { PLATE_REGISTRY_BASES } from '../../../../apps/www/src/lib/plate-registry-styles';

const REPO_ROOT = path.resolve(import.meta.dir, '../../../..');
const REGISTRY_ROOT = path.join(REPO_ROOT, 'apps/www/src/registry');
const SHADCN_ROOT = path.resolve(REPO_ROOT, '../shadcn/apps/v4/registry/bases');
const BASES = PLATE_REGISTRY_BASES;
const MANIFEST_PATH = path.join(import.meta.dir, 'manifest.json');

type Node = Record<string, any>;

function parseCode(source: string) {
  return parse(source, {
    plugins: ['typescript', 'jsx', 'dynamicImport'],
    sourceType: 'unambiguous',
  }) as unknown as Node;
}

function walk(node: unknown, visit: (node: Node) => void) {
  if (!node || typeof node !== 'object') return;
  const record = node as Node;
  visit(record);

  for (const [key, value] of Object.entries(record)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else {
      walk(value, visit);
    }
  }
}

function unique(values: Iterable<string>) {
  return [...new Set(values)].sort();
}

function sourcePath(manifestPath: string) {
  if (manifestPath.startsWith('external:')) {
    return path.join(REPO_ROOT, manifestPath.slice('external:'.length));
  }

  return path.join(REGISTRY_ROOT, manifestPath);
}

function getExportNames(filePath: string) {
  if (!existsSync(filePath)) return [];
  const names: string[] = [];
  const ast = parseCode(readFileSync(filePath, 'utf8'));

  walk(ast, (node) => {
    if (node.type !== 'ExportNamedDeclaration') return;

    const declaration = node.declaration as Node | undefined;
    if (
      declaration?.type === 'FunctionDeclaration' ||
      declaration?.type === 'ClassDeclaration' ||
      declaration?.type === 'TSTypeAliasDeclaration' ||
      declaration?.type === 'TSInterfaceDeclaration'
    ) {
      if (declaration.id?.name) names.push(declaration.id.name);
    } else if (declaration?.type === 'VariableDeclaration') {
      for (const item of declaration.declarations ?? []) {
        if (item.id?.type === 'Identifier') names.push(item.id.name);
      }
    }

    for (const specifier of node.specifiers ?? []) {
      const exported = specifier.exported;
      if (exported?.name) names.push(exported.name);
      if (typeof exported?.value === 'string') names.push(exported.value);
    }
  });

  return unique(names);
}

function getUiUsage(filePath: string) {
  if (!existsSync(filePath) || !/\.[cm]?[jt]sx?$/.test(filePath)) return [];
  const ast = parseCode(readFileSync(filePath, 'utf8'));
  const imports = new Map<
    string,
    { imported: string; local: string; module: string }
  >();

  walk(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    const value = node.source?.value;
    if (typeof value !== 'string' || !/^@\/components\/ui\//.test(value)) {
      return;
    }
    const module = value.split('/').at(-1)!;

    for (const specifier of node.specifiers ?? []) {
      const local = specifier.local?.name;
      if (!local) continue;
      let imported = 'default';
      if (specifier.type === 'ImportSpecifier') {
        imported = specifier.imported?.name ?? specifier.imported?.value;
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        imported = '*';
      }
      imports.set(local, { imported, local, module });
    }
  });

  const usage = new Map<
    string,
    {
      callCount: number;
      imported: string;
      jsxCount: number;
      local: string;
      module: string;
      props: Set<string>;
    }
  >();
  for (const entry of imports.values()) {
    usage.set(entry.local, {
      ...entry,
      callCount: 0,
      jsxCount: 0,
      props: new Set(),
    });
  }

  walk(ast, (node) => {
    if (node.type === 'JSXOpeningElement' && node.name?.type === 'JSXIdentifier') {
      const row = usage.get(node.name.name);
      if (!row) return;
      row.jsxCount += 1;
      for (const attribute of node.attributes ?? []) {
        if (attribute.type === 'JSXSpreadAttribute') {
          row.props.add('...');
        } else if (attribute.name?.type === 'JSXIdentifier') {
          row.props.add(attribute.name.name);
        }
      }
    }

    if (
      (node.type === 'CallExpression' || node.type === 'TaggedTemplateExpression') &&
      node.callee?.type === 'Identifier'
    ) {
      const row = usage.get(node.callee.name);
      if (row) row.callCount += 1;
    }
  });

  return [...usage.values()]
    .map((row) => ({ ...row, props: unique(row.props) }))
    .sort((a, b) =>
      `${a.module}:${a.imported}`.localeCompare(`${b.module}:${b.imported}`)
    );
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const items = manifest.items
  .filter((item: any) => item.shadcnUiImports.length > 0)
  .map((item: any) => {
    const usages = item.files.flatMap((file: any) =>
      getUiUsage(sourcePath(file.path)).map((usage) => ({
        ...usage,
        file: file.path,
      }))
    );

    return {
      name: item.name,
      sourceKind: item.sourceKind,
      usages,
    };
  });

const modules = unique(
  items.flatMap((item: any) => item.usages.map((usage: any) => usage.module))
).map((module) => {
  const exports = Object.fromEntries(
    BASES.map((base) => [
      base,
      getExportNames(path.join(SHADCN_ROOT, base, 'ui', `${module}.tsx`)),
    ])
  );
  const importedSymbols = unique(
    items.flatMap((item: any) =>
      item.usages
        .filter((usage: any) => usage.module === module)
        .map((usage: any) => usage.imported)
    )
  );

  return {
    exports,
    importedSymbols,
    missingByBase: Object.fromEntries(
      BASES.map((base) => [
        base,
        importedSymbols.filter((name) => !exports[base].includes(name)),
      ])
    ),
    module,
  };
});

const rows = items.flatMap((item: any) =>
  item.usages.map((usage: any) => {
    const module = modules.find((row) => row.module === usage.module)!;
    return {
      ...usage,
      item: item.name,
      missingIn: BASES.filter(
        (base) => !module.exports[base].includes(usage.imported)
      ),
      sourceKind: item.sourceKind,
    };
  })
);

const result = {
  bases: BASES,
  boundaries: {
    itemCount: items.length,
    moduleCount: modules.length,
    usageCount: rows.length,
  },
  items,
  modules,
  rows,
};

writeFileSync(
  path.join(import.meta.dir, 'ui-compatibility.json'),
  `${JSON.stringify(result, null, 2)}\n`
);

const header = [
  'item',
  'sourceKind',
  'file',
  'module',
  'imported',
  'jsxCount',
  'callCount',
  'props',
  'missingIn',
].join('\t');
const lines = rows.map((row: any) =>
  [
    row.item,
    row.sourceKind,
    row.file,
    row.module,
    row.imported,
    row.jsxCount,
    row.callCount,
    row.props.join(','),
    row.missingIn.join(','),
  ].join('\t')
);
writeFileSync(
  path.join(import.meta.dir, 'ui-compatibility.tsv'),
  `${[header, ...lines].join('\n')}\n`
);

console.log(
  JSON.stringify(
    {
      ...result.boundaries,
      incompatibleUsages: rows.filter((row: any) => row.missingIn.length > 0)
        .length,
      modulesWithMissingSymbols: modules.filter((module) =>
        Object.values(module.missingByBase).some(
          (names: unknown) => (names as string[]).length > 0
        )
      ).length,
    },
    null,
    2
  )
);
