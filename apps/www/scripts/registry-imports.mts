import { parse } from '@babel/parser';

const IMPORTABLE_SOURCE_FILE_REGEX = /\.[cm]?[jt]sx?$/;

type AstNode = {
  [key: string]: unknown;
  end?: number | null;
  loc?: {
    start: {
      column: number;
      line: number;
    };
  } | null;
  start?: number | null;
  type: string;
};

export type ModuleImport = {
  column: number;
  line: number;
  specifier: string;
};

function isAstNode(value: unknown): value is AstNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string'
  );
}

function isFunctionNode(node: AstNode) {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ObjectMethod' ||
    node.type === 'ClassMethod' ||
    node.type === 'ClassPrivateMethod'
  );
}

function patternBindsRequire(value: unknown): boolean {
  if (!isAstNode(value)) return false;
  if (value.type === 'Identifier') return value.name === 'require';
  if (value.type === 'RestElement') return patternBindsRequire(value.argument);
  if (value.type === 'AssignmentPattern') {
    return patternBindsRequire(value.left);
  }
  if (value.type === 'ObjectProperty') {
    return patternBindsRequire(value.value);
  }
  if (value.type === 'ArrayPattern') {
    return ((value.elements as unknown[] | undefined) ?? []).some(
      patternBindsRequire
    );
  }
  if (value.type === 'ObjectPattern') {
    return ((value.properties as unknown[] | undefined) ?? []).some(
      patternBindsRequire
    );
  }

  return false;
}

function declarationBindsRequire(node: AstNode): boolean {
  if (node.type === 'ImportDeclaration') {
    return ((node.specifiers as unknown[] | undefined) ?? []).some(
      (specifier) =>
        isAstNode(specifier) ? patternBindsRequire(specifier.local) : false
    );
  }
  if (node.type === 'VariableDeclaration') {
    return ((node.declarations as unknown[] | undefined) ?? []).some(
      (declaration) =>
        isAstNode(declaration) && patternBindsRequire(declaration.id)
    );
  }
  if (
    node.type === 'ClassDeclaration' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'TSEnumDeclaration'
  ) {
    return patternBindsRequire(node.id);
  }

  return false;
}

function hasFunctionScopedRequire(value: unknown, root: AstNode): boolean {
  if (Array.isArray(value)) {
    return value.some((child) => hasFunctionScopedRequire(child, root));
  }
  if (!isAstNode(value)) return false;
  if (value !== root && isFunctionNode(value)) return false;
  if (
    value.type === 'VariableDeclaration' &&
    value.kind === 'var' &&
    declarationBindsRequire(value)
  ) {
    return true;
  }

  return Object.values(value).some((child) =>
    hasFunctionScopedRequire(child, root)
  );
}

function scopeBindsRequire(node: AstNode): boolean {
  if (node.type === 'Program') {
    const body = (node.body as unknown[] | undefined) ?? [];

    return (
      body.some(
        (statement) =>
          isAstNode(statement) && declarationBindsRequire(statement)
      ) || hasFunctionScopedRequire(node, node)
    );
  }
  if (isFunctionNode(node)) {
    return (
      patternBindsRequire(node.id) ||
      ((node.params as unknown[] | undefined) ?? []).some(
        patternBindsRequire
      ) ||
      hasFunctionScopedRequire(node, node)
    );
  }
  if (node.type === 'BlockStatement') {
    return ((node.body as unknown[] | undefined) ?? []).some((statement) => {
      if (!isAstNode(statement)) return false;
      if (
        statement.type === 'VariableDeclaration' &&
        statement.kind === 'var'
      ) {
        return false;
      }

      return declarationBindsRequire(statement);
    });
  }
  if (node.type === 'CatchClause') {
    return patternBindsRequire(node.param);
  }

  return false;
}

function isScopeNode(node: AstNode) {
  return (
    node.type === 'Program' ||
    node.type === 'BlockStatement' ||
    node.type === 'CatchClause' ||
    isFunctionNode(node)
  );
}

function getLocation(node: AstNode) {
  return {
    column: (node.loc?.start.column ?? 0) + 1,
    line: node.loc?.start.line ?? 1,
  };
}

function getLiteralSpecifiers(node: AstNode): string[] | null {
  if (node.type === 'StringLiteral' && typeof node.value === 'string') {
    return [node.value];
  }
  if (node.type === 'TemplateLiteral') {
    const expressions = (node.expressions as unknown[] | undefined) ?? [];
    const quasis = (node.quasis as AstNode[] | undefined) ?? [];

    if (expressions.length > 0 || quasis.length !== 1) return null;

    const value = quasis[0]?.value as
      | { cooked?: string | null; raw?: string }
      | undefined;

    return [value?.cooked ?? value?.raw ?? ''];
  }
  if (node.type === 'ConditionalExpression') {
    const consequent = isAstNode(node.consequent)
      ? getLiteralSpecifiers(node.consequent)
      : null;
    const alternate = isAstNode(node.alternate)
      ? getLiteralSpecifiers(node.alternate)
      : null;

    return consequent && alternate ? [...consequent, ...alternate] : null;
  }
  if (
    node.type === 'ParenthesizedExpression' ||
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSTypeAssertion'
  ) {
    return isAstNode(node.expression)
      ? getLiteralSpecifiers(node.expression)
      : null;
  }

  return null;
}

function formatDynamicImportError(
  filePath: string,
  node: AstNode,
  kind: string
) {
  const { column, line } = getLocation(node);

  return `${filePath}:${line}:${column}: ${kind} must use a string literal, a template without substitutions, or finite literal conditional branches.`;
}

export function isImportableRegistrySource(filePath: string) {
  return IMPORTABLE_SOURCE_FILE_REGEX.test(filePath);
}

export function parseModuleImports(
  source: string,
  { filePath = '<source>' }: { filePath?: string } = {}
): ModuleImport[] {
  const { program } = parse(source, {
    plugins: ['jsx', 'typescript'],
    sourceFilename: filePath,
    sourceType: 'unambiguous',
  });
  const imports = new Map<string, ModuleImport>();

  const addImports = (node: AstNode, kind: string) => {
    const specifiers = getLiteralSpecifiers(node);

    if (!specifiers) {
      throw new Error(formatDynamicImportError(filePath, node, kind));
    }

    const location = getLocation(node);
    for (const specifier of specifiers) {
      imports.set(specifier, { ...location, specifier });
    }
  };

  const visit = (value: unknown, shadowedRequire: boolean) => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child, shadowedRequire);

      return;
    }
    if (!isAstNode(value)) return;

    const nextShadowedRequire =
      shadowedRequire || (isScopeNode(value) && scopeBindsRequire(value));

    if (
      (value.type === 'ImportDeclaration' ||
        value.type === 'ExportAllDeclaration' ||
        value.type === 'ExportNamedDeclaration') &&
      isAstNode(value.source)
    ) {
      addImports(value.source, 'module specifier');
    } else if (value.type === 'TSImportType' && isAstNode(value.argument)) {
      addImports(value.argument, 'TypeScript import query');
    } else if (
      value.type === 'TSExternalModuleReference' &&
      isAstNode(value.expression)
    ) {
      addImports(value.expression, 'TypeScript import-equals');
    } else if (value.type === 'ImportExpression' && isAstNode(value.source)) {
      addImports(value.source, 'dynamic import');
    } else if (value.type === 'CallExpression') {
      const callee = isAstNode(value.callee) ? value.callee : null;
      const arguments_ = (value.arguments as unknown[] | undefined) ?? [];
      const [argument] = arguments_;

      if (callee?.type === 'Import') {
        if (arguments_.length !== 1 || !isAstNode(argument)) {
          throw new Error(
            formatDynamicImportError(filePath, value, 'dynamic import')
          );
        }
        addImports(argument, 'dynamic import');
      } else if (
        !nextShadowedRequire &&
        callee?.type === 'Identifier' &&
        callee.name === 'require'
      ) {
        if (arguments_.length !== 1 || !isAstNode(argument)) {
          throw new Error(formatDynamicImportError(filePath, value, 'require'));
        }
        addImports(argument, 'require');
      }
    }

    for (const [key, child] of Object.entries(value)) {
      if (
        key === 'loc' ||
        key === 'leadingComments' ||
        key === 'trailingComments'
      ) {
        continue;
      }
      visit(child, nextShadowedRequire);
    }
  };

  visit(program, false);

  return [...imports.values()];
}
