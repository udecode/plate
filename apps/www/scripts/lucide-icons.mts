import { parse } from '@babel/parser';

import { getIconNames, ICON_LIBRARIES } from './icon-names.mts';
import { type AstNode, getLocation, isAstNode } from './registry-imports.mts';

export type SourceLocation = ReturnType<typeof getLocation>;

export type LucideImport = {
  imported: string;
  local: string;
  location: SourceLocation;
};

export type LucideElement = {
  imported: string;
  location: SourceLocation;
};

export type LucideStray = {
  location: SourceLocation;
  message: string;
};

export type LucideUses = {
  elements: LucideElement[];
  imports: LucideImport[];
  strays: LucideStray[];
};

const LUCIDE_PACKAGE = 'lucide-react';
const ICON_NAMES_FILE = 'apps/www/scripts/icon-names.mts';
const ELEMENT_FIX =
  'import each icon by name and write it as a self-closing JSX element, such as `icon: <Name className="..." />`';
const TYPE_FIX =
  "type an icon value as React.ReactNode and an SVG component's props as React.ComponentProps<'svg'>";

function isLucideModule(specifier: string) {
  return (
    specifier === LUCIDE_PACKAGE || specifier.startsWith(`${LUCIDE_PACKAGE}/`)
  );
}

function getLucideModule(value: unknown) {
  return isAstNode(value) &&
    value.type === 'StringLiteral' &&
    typeof value.value === 'string' &&
    isLucideModule(value.value)
    ? value.value
    : null;
}

function getLoadedLucideModule(node: AstNode) {
  switch (node.type) {
    case 'CallExpression': {
      const { callee } = node;
      const isLoader =
        isAstNode(callee) &&
        (callee.type === 'Import' ||
          (callee.type === 'Identifier' && callee.name === 'require'));

      return isLoader && Array.isArray(node.arguments)
        ? getLucideModule(node.arguments[0])
        : null;
    }
    case 'ImportExpression': {
      return getLucideModule(node.source);
    }
    case 'TSExternalModuleReference': {
      return getLucideModule(node.expression);
    }
    case 'TSImportType': {
      return getLucideModule(node.argument);
    }
    default: {
      return null;
    }
  }
}

function parseProgram(source: string, filePath: string) {
  try {
    return parse(source, {
      plugins: ['jsx', 'typescript'],
      sourceFilename: filePath,
      sourceType: 'module',
    }).program;
  } catch (error) {
    throw new Error(
      `${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}

export function collectLucideUses(
  source: string,
  filePath: string
): LucideUses {
  const program = parseProgram(source, filePath);
  const uses: LucideUses = { elements: [], imports: [], strays: [] };
  const importedByLocal = new Map<string, string>();
  const strayKeys = new Set<string>();
  // Babel clones a shorthand property's or export specifier's identifier, so
  // one written name can reach the walk as two nodes at one location.
  const addStray = (node: Pick<AstNode, 'loc'>, message: string) => {
    const location = getLocation(node);
    const strayKey = `${location.line}:${location.column}`;

    if (strayKeys.has(strayKey)) return;

    strayKeys.add(strayKey);
    uses.strays.push({ location, message });
  };

  for (const statement of program.body) {
    if (
      (statement.type === 'ExportAllDeclaration' ||
        statement.type === 'ExportNamedDeclaration') &&
      statement.source &&
      isLucideModule(statement.source.value)
    ) {
      addStray(
        statement,
        `re-exports ${statement.source.value}; ${ELEMENT_FIX}`
      );
      continue;
    }
    if (
      statement.type !== 'ImportDeclaration' ||
      !isLucideModule(statement.source.value)
    ) {
      continue;
    }
    if (statement.source.value !== LUCIDE_PACKAGE) {
      addStray(
        statement,
        `imports ${statement.source.value}; import each icon from ${LUCIDE_PACKAGE} itself`
      );
      continue;
    }
    if (statement.importKind === 'type') {
      addStray(statement, `imports a ${LUCIDE_PACKAGE} type; ${TYPE_FIX}`);
      continue;
    }
    if (statement.specifiers.length === 0) {
      addStray(
        statement,
        `imports ${LUCIDE_PACKAGE} without naming an icon; ${ELEMENT_FIX}`
      );
      continue;
    }
    for (const specifier of statement.specifiers) {
      const local = specifier.local.name;

      if (specifier.type !== 'ImportSpecifier') {
        addStray(
          specifier,
          `imports ${LUCIDE_PACKAGE} as ${local}; ${ELEMENT_FIX}`
        );
        continue;
      }
      if (specifier.importKind === 'type') {
        addStray(
          specifier,
          `imports the ${LUCIDE_PACKAGE} type ${local}; ${TYPE_FIX}`
        );
        continue;
      }

      const imported =
        specifier.imported.type === 'Identifier'
          ? specifier.imported.name
          : specifier.imported.value;

      importedByLocal.set(local, imported);
      uses.imports.push({ imported, local, location: getLocation(specifier) });
    }
  }

  const visit = (value: unknown, parent: AstNode | null, key: string) => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child, parent, key);

      return;
    }
    if (!isAstNode(value) || value.type === 'ImportDeclaration') return;

    const loaded = getLoadedLucideModule(value);

    if (loaded) {
      addStray(
        value,
        value.type === 'TSImportType'
          ? `imports a ${loaded} type; ${TYPE_FIX}`
          : `loads ${loaded} without a static import; ${ELEMENT_FIX}`
      );
    }

    const name =
      (value.type === 'Identifier' || value.type === 'JSXIdentifier') &&
      typeof value.name === 'string'
        ? value.name
        : null;
    const imported = name === null ? undefined : importedByLocal.get(name);

    if (name !== null && imported !== undefined && parent) {
      if (
        parent.type === 'JSXOpeningElement' &&
        parent.selfClosing === true &&
        key === 'name'
      ) {
        uses.elements.push({ imported, location: getLocation(value) });
      } else if (parent.type !== 'JSXMemberExpression' || key !== 'property') {
        addStray(
          value,
          `uses ${name} other than as a self-closing JSX element; render it as \`<${name} className="..." />\` and type an icon value as React.ReactNode`
        );
      }
    }

    for (const [childKey, child] of Object.entries(value)) {
      if (
        childKey !== 'loc' &&
        childKey !== 'leadingComments' &&
        childKey !== 'trailingComments'
      ) {
        visit(child, value, childKey);
      }
    }
  };

  visit(program, null, '');

  return uses;
}

export function findMissingIconNames(imports: LucideImport[]): LucideStray[] {
  return imports.flatMap(({ imported, location }) => {
    const names = getIconNames(imported);
    const missing = ICON_LIBRARIES.filter((library) => !names?.[library]);

    if (missing.length === 0) return [];

    return [
      {
        location,
        message: names
          ? `imports ${imported}, whose row in ${ICON_NAMES_FILE} has no ${missing.join(', ')} name`
          : `imports ${imported}, which has no row in ${ICON_NAMES_FILE}; add its ${missing.join(', ')} names`,
      },
    ];
  });
}
