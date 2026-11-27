import { extname } from 'node:path';

import { parse, type ParserPlugin } from '@babel/parser';

import { applyCodemodEdits, buildTodoCommentEdit } from '../splice';
import type {
  CodemodDefinition,
  CodemodDiagnostic,
  CodemodEdit,
  CodemodTransformOptions,
  CodemodTransformResult,
} from '../types';
import {
  LEGACY_PLITE_SHELL_EXPORTS,
  PLITE_ANNOTATION_TYPES,
  PLITE_ONLY_DIAGNOSTICS,
  PLITE_TO_PLATE_MODULE_MAP,
  PLITE_TO_PLATE_SYMBOL_RENAMES,
  SAFE_DOM_EDITOR_CLIPBOARD_METHODS,
  SAFE_DOM_EDITOR_METHODS,
} from './plite-to-plate-classification';

type AstNode = {
  [key: string]: unknown;
  end?: number | null;
  loc?: {
    start: { column: number; line: number };
  } | null;
  start?: number | null;
  type: string;
};

type ImportBinding = {
  importKind: 'type' | 'value';
  importedName: string;
  localName: string;
  sourceModule: string;
};

type BindingMap = Map<string, ImportBinding>;

type AddedImportRequest = {
  importKind: 'type' | 'value';
  importedName: string;
  localName: string;
  targetModule: string;
};

const QUICK_PLITE_CHECK = /['"]plitejs(?:\/[^'"]*)?['"]/;

const ATOMIC_RECEIVER_TYPES = new Set([
  'CallExpression',
  'Identifier',
  'MemberExpression',
  'OptionalCallExpression',
  'OptionalMemberExpression',
  'ParenthesizedExpression',
  'ThisExpression',
]);

const SCOPE_NODE_TYPES = new Set([
  'ArrowFunctionExpression',
  'BlockStatement',
  'CatchClause',
  'ClassMethod',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'FunctionDeclaration',
  'FunctionExpression',
  'ObjectMethod',
]);

const STATEMENT_NODE_TYPES = new Set([
  'ClassDeclaration',
  'DoWhileStatement',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ExpressionStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'FunctionDeclaration',
  'IfStatement',
  'ImportDeclaration',
  'ReturnStatement',
  'SwitchStatement',
  'ThrowStatement',
  'TryStatement',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'VariableDeclaration',
  'WhileStatement',
]);

const JSX_COMPONENT_RENAMES: Readonly<Record<string, string>> = {
  Editable: 'EditorContent',
  PagedEditable: 'PagedEditorContent',
  VirtualizedEditable: 'VirtualizedEditorContent',
};

const RENDER_PROP_DIAGNOSTIC_NAMES = new Set([
  'renderElement',
  'renderLeaf',
  'renderPlaceholder',
  'renderText',
  'renderVoid',
]);

const OBSERVER_PROP_NAMES = new Set([
  'onCommit',
  'onSelectionChange',
  'onValueChange',
]);

const CONTEXT_GENERIC_TYPES = new Set([
  'CommitContext',
  'SelectionChangeContext',
  'ValueChangeContext',
]);

const LEGACY_ARRAY_METHODS = new Set([
  'every',
  'filter',
  'find',
  'flatMap',
  'forEach',
  'length',
  'map',
  'reduce',
  'slice',
  'some',
]);

export const getBabelPluginsForFile = (filePath: string): ParserPlugin[] => {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.ts' || ext === '.mts' || ext === '.cts') {
    return ['typescript', 'decorators-legacy'];
  }
  if (ext === '.tsx') {
    return ['typescript', 'jsx', 'decorators-legacy'];
  }

  return ['jsx', 'decorators-legacy'];
};

const parseSource = (source: string, filePath: string): AstNode =>
  parse(source, {
    plugins: getBabelPluginsForFile(filePath),
    sourceType: 'unambiguous',
  }) as unknown as AstNode;

const isAstNode = (value: unknown): value is AstNode =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string';

const collectPatternNames = (
  node: AstNode | null | undefined,
  out: Set<string>
) => {
  if (!node) return;

  switch (node.type) {
    case 'ArrayPattern': {
      const elements = node.elements as Array<AstNode | null> | undefined;
      for (const el of elements ?? []) collectPatternNames(el, out);
      break;
    }
    case 'AssignmentPattern': {
      collectPatternNames(node.left as AstNode, out);
      break;
    }
    case 'Identifier': {
      if (typeof node.name === 'string') out.add(node.name);
      break;
    }
    case 'ObjectPattern': {
      const properties = node.properties as AstNode[] | undefined;
      for (const prop of properties ?? []) {
        if (prop.type === 'RestElement') {
          collectPatternNames(prop.argument as AstNode, out);
        } else if (prop.type === 'ObjectProperty') {
          collectPatternNames(prop.value as AstNode, out);
        }
      }
      break;
    }
    case 'RestElement': {
      collectPatternNames(node.argument as AstNode, out);
      break;
    }
    default: {
      break;
    }
  }
};

const collectLocalScopeDeclarations = (node: AstNode): Set<string> => {
  const names = new Set<string>();

  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'ClassMethod' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ObjectMethod'
  ) {
    const params = node.params as AstNode[] | undefined;
    for (const param of params ?? []) collectPatternNames(param, names);
    if (
      node.type === 'FunctionExpression' &&
      isAstNode(node.id) &&
      typeof node.id.name === 'string'
    ) {
      names.add(node.id.name);
    }
  } else if (node.type === 'CatchClause') {
    collectPatternNames(node.param as AstNode | null, names);
  } else if (node.type === 'BlockStatement') {
    const body = node.body as AstNode[] | undefined;
    for (const stmt of body ?? []) {
      if (stmt.type === 'VariableDeclaration') {
        const declarations = stmt.declarations as AstNode[] | undefined;
        for (const decl of declarations ?? []) {
          collectPatternNames(decl.id as AstNode, names);
        }
      } else if (
        (stmt.type === 'FunctionDeclaration' ||
          stmt.type === 'ClassDeclaration') &&
        isAstNode(stmt.id) &&
        typeof stmt.id.name === 'string'
      ) {
        names.add(stmt.id.name);
      }
    }
  } else if (
    node.type === 'ForStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement'
  ) {
    const init = (node.init ?? node.left) as AstNode | null | undefined;
    if (init?.type === 'VariableDeclaration') {
      const declarations = init.declarations as AstNode[] | undefined;
      for (const decl of declarations ?? []) {
        collectPatternNames(decl.id as AstNode, names);
      }
    }
  }

  return names;
};

type WalkContext = {
  ancestors: AstNode[];
  isShadowed: (name: string) => boolean;
  parent: AstNode | null;
  parentKey: string | null;
};

const walkAst = (
  root: AstNode,
  visit: (node: AstNode, ctx: WalkContext) => boolean | void
) => {
  const scopes: Array<Set<string>> = [];
  const ancestors: AstNode[] = [];

  const isShadowed = (name: string) => {
    for (let index = scopes.length - 1; index >= 0; index -= 1) {
      if (scopes[index]?.has(name)) return true;
    }
    return false;
  };

  const recurse = (
    node: AstNode,
    parent: AstNode | null,
    parentKey: string | null
  ) => {
    const pushesScope = SCOPE_NODE_TYPES.has(node.type);
    if (pushesScope) scopes.push(collectLocalScopeDeclarations(node));

    const shouldContinue = visit(node, {
      ancestors,
      isShadowed,
      parent,
      parentKey,
    });

    if (shouldContinue !== false) {
      ancestors.push(node);
      for (const [key, value] of Object.entries(node)) {
        if (
          key === 'loc' ||
          key === 'start' ||
          key === 'end' ||
          key === 'extra' ||
          key === 'leadingComments' ||
          key === 'trailingComments' ||
          key === 'innerComments' ||
          key === 'comments' ||
          key === 'tokens'
        ) {
          continue;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            if (isAstNode(item)) recurse(item, node, key);
          }
        } else if (isAstNode(value)) {
          recurse(value, node, key);
        }
      }
      ancestors.pop();
    }

    if (pushesScope) scopes.pop();
  };

  recurse(root, null, null);
};

const isPliteModule = (specifier: string): boolean =>
  specifier === 'plitejs' || specifier.startsWith('plitejs/');

const collectPliteImports = (ast: AstNode): BindingMap => {
  const bindings: BindingMap = new Map();
  const program = ast.program as AstNode | undefined;
  const body = (program?.body as AstNode[] | undefined) ?? [];

  for (const stmt of body) {
    if (stmt.type !== 'ImportDeclaration') continue;
    const sourceNode = stmt.source as AstNode | undefined;
    const sourceModule = sourceNode?.value;
    if (typeof sourceModule !== 'string' || !isPliteModule(sourceModule)) {
      continue;
    }
    const declImportKind = stmt.importKind === 'type' ? 'type' : 'value';
    const specifiers = (stmt.specifiers as AstNode[] | undefined) ?? [];
    for (const spec of specifiers) {
      if (spec.type !== 'ImportSpecifier') continue;
      const imported = spec.imported as AstNode;
      const local = spec.local as AstNode;
      const importedName =
        imported.type === 'Identifier'
          ? String(imported.name)
          : String(imported.value);
      const localName = String(local.name);
      const specKind =
        declImportKind === 'type' || spec.importKind === 'type'
          ? 'type'
          : 'value';
      bindings.set(localName, {
        importKind: specKind,
        importedName,
        localName,
        sourceModule,
      });
    }
  }

  return bindings;
};

const getNodeStart = (node: AstNode): number =>
  typeof node.start === 'number' ? node.start : 0;

const getNodeEnd = (node: AstNode): number =>
  typeof node.end === 'number' ? node.end : 0;

const makeDiagnostic = (
  file: string,
  node: AstNode,
  kind: CodemodDiagnostic['kind'],
  code: string,
  message: string,
  hint?: string
): CodemodDiagnostic => ({
  code,
  column: (node.loc?.start.column ?? 0) + 1,
  file,
  ...(hint ? { hint } : {}),
  kind,
  line: node.loc?.start.line ?? 1,
  message,
});

const getPropertyName = (prop: AstNode): string | null => {
  if (prop.computed) return null;
  const key = prop.key as AstNode | undefined;
  if (!key) return null;
  if (key.type === 'Identifier' && typeof key.name === 'string') {
    return key.name;
  }
  if (key.type === 'StringLiteral' && typeof key.value === 'string') {
    return key.value;
  }
  return null;
};

const isReferenceIdentifier = (
  node: AstNode,
  parent: AstNode | null,
  parentKey: string | null
): boolean => {
  if (node.type !== 'Identifier' || !parent) return false;
  if (
    parent.type === 'ImportSpecifier' ||
    parent.type === 'ImportDefaultSpecifier' ||
    parent.type === 'ImportNamespaceSpecifier'
  ) {
    return false;
  }
  if (
    (parent.type === 'MemberExpression' ||
      parent.type === 'OptionalMemberExpression') &&
    parentKey === 'property' &&
    !parent.computed
  ) {
    return false;
  }
  if (
    (parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') &&
    parentKey === 'key' &&
    !parent.computed &&
    !parent.shorthand
  ) {
    return false;
  }
  if (
    (parent.type === 'ClassProperty' || parent.type === 'ClassMethod') &&
    parentKey === 'key' &&
    !parent.computed
  ) {
    return false;
  }
  if (parent.type === 'TSPropertySignature' && parentKey === 'key') {
    return false;
  }
  if (parent.type === 'LabeledStatement' && parentKey === 'label') {
    return false;
  }

  return true;
};

const formatReceiver = (source: string, node: AstNode): string => {
  const text = source.slice(getNodeStart(node), getNodeEnd(node));
  return ATOMIC_RECEIVER_TYPES.has(node.type) ? text : `(${text})`;
};

const findEnclosingStatementOrJsx = (
  ancestors: AstNode[],
  fallback: AstNode
): { inJsxChildren: boolean; target: AstNode } => {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index];
    if (!ancestor) continue;
    if (
      (ancestor.type === 'JSXElement' || ancestor.type === 'JSXFragment') &&
      index > 0
    ) {
      const parentOfJsx = ancestors[index - 1];
      if (
        parentOfJsx &&
        (parentOfJsx.type === 'JSXElement' ||
          parentOfJsx.type === 'JSXFragment')
      ) {
        return { inJsxChildren: true, target: ancestor };
      }
    }
    if (STATEMENT_NODE_TYPES.has(ancestor.type)) {
      return { inJsxChildren: false, target: ancestor };
    }
  }

  return { inJsxChildren: false, target: fallback };
};

type PassContext = {
  addedImports: AddedImportRequest[];
  diagnostics: CodemodDiagnostic[];
  filePath: string;
};

const runPass1 = (
  source: string,
  ctx: PassContext
): { code: string; editsCount: number } => {
  const ast = parseSource(source, ctx.filePath);
  const bindings = collectPliteImports(ast);
  const edits: CodemodEdit[] = [];

  walkAst(ast, (node, walk) => {
    if (node.type === 'CallExpression') {
      const callee = node.callee as AstNode;
      const args = (node.arguments as AstNode[]) ?? [];

      if (callee.type === 'MemberExpression' && !callee.computed) {
        const prop = callee.property as AstNode;
        const propName = prop.type === 'Identifier' ? String(prop.name) : null;
        const obj = callee.object as AstNode;

        if (obj.type === 'Identifier' && propName) {
          const binding = bindings.get(String(obj.name));
          if (
            binding &&
            binding.sourceModule === 'plitejs/dom' &&
            binding.importedName === 'DOMEditor'
          ) {
            const objName = String(obj.name);
            if (walk.isShadowed(objName)) {
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  node,
                  'warning',
                  'shadowed-binding',
                  `Skipped rewriting shadowed identifier "${objName}".`
                )
              );
              return undefined;
            }
            const firstArg = args[0];
            if (
              !SAFE_DOM_EDITOR_METHODS.has(propName) ||
              !firstArg ||
              args.some((arg) => arg.type === 'SpreadElement')
            ) {
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  node,
                  'manual',
                  'dom-editor-unsupported',
                  `DOMEditor.${propName}(...) cannot be rewritten 1:1 to editor.api.dom.${propName}(...).`,
                  'Rewrite manually or verify receiver and arguments.'
                )
              );
              return undefined;
            }
            const receiver = formatReceiver(source, firstArg);
            const rest = args
              .slice(1)
              .map((arg) => source.slice(getNodeStart(arg), getNodeEnd(arg)))
              .join(', ');
            edits.push({
              end: getNodeEnd(node),
              replacement: `${receiver}.api.dom.${propName}(${rest})`,
              start: getNodeStart(node),
            });
            return false;
          }
        }

        if (
          obj.type === 'MemberExpression' &&
          !obj.computed &&
          propName &&
          (obj.object as AstNode).type === 'Identifier' &&
          (obj.property as AstNode).type === 'Identifier' &&
          (obj.property as AstNode).name === 'clipboard'
        ) {
          const rootId = obj.object as AstNode;
          const rootName = String(rootId.name);
          const binding = bindings.get(rootName);
          if (
            binding &&
            binding.sourceModule === 'plitejs/dom' &&
            binding.importedName === 'DOMEditor'
          ) {
            if (walk.isShadowed(rootName)) {
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  node,
                  'warning',
                  'shadowed-binding',
                  `Skipped rewriting shadowed identifier "${rootName}".`
                )
              );
              return undefined;
            }
            const firstArg = args[0];
            if (
              !SAFE_DOM_EDITOR_CLIPBOARD_METHODS.has(propName) ||
              !firstArg ||
              args.some((arg) => arg.type === 'SpreadElement')
            ) {
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  node,
                  'manual',
                  'dom-editor-unsupported',
                  `DOMEditor.clipboard.${propName}(...) cannot be rewritten 1:1.`,
                  'Rewrite manually using editor.api.dom.clipboard.'
                )
              );
              return undefined;
            }
            const receiver = formatReceiver(source, firstArg);
            const rest = args
              .slice(1)
              .map((arg) => source.slice(getNodeStart(arg), getNodeEnd(arg)))
              .join(', ');
            edits.push({
              end: getNodeEnd(node),
              replacement: `${receiver}.api.dom.clipboard.${propName}(${rest})`,
              start: getNodeStart(node),
            });
            return false;
          }
        }
      }

      if (callee.type === 'Identifier' && isAstNode(node.typeParameters)) {
        const binding = bindings.get(String(callee.name));
        if (binding && !walk.isShadowed(String(callee.name))) {
          if (
            binding.sourceModule === 'plitejs/react' &&
            binding.importedName === 'useElement'
          ) {
            edits.push({
              end: getNodeEnd(node.typeParameters),
              replacement: '',
              start: getNodeStart(node.typeParameters),
            });
          } else if (
            (binding.sourceModule === 'plitejs' ||
              binding.sourceModule === 'plitejs/react') &&
            (binding.importedName === 'createEditor' ||
              binding.importedName === 'useCreateEditor')
          ) {
            edits.push({
              end: getNodeEnd(node.typeParameters),
              replacement: '',
              start: getNodeStart(node.typeParameters),
            });
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                node,
                'scaffold',
                'editor-value-generic',
                `Dropped explicit generic on ${binding.importedName}<...>(). Plate derives editor types from plugins.`,
                'Run `npx @platejs/cli generate` to generate exact schema types.'
              )
            );
          }
        }
      }
    }

    if (node.type === 'TSTypeReference') {
      const typeName = node.typeName as AstNode;
      if (
        typeName.type === 'Identifier' &&
        bindings.get(String(typeName.name))?.sourceModule ===
          'plitejs/history' &&
        bindings.get(String(typeName.name))?.importedName ===
          'HistoryOptions' &&
        !walk.isShadowed(String(typeName.name))
      ) {
        edits.push({
          end: getNodeEnd(node),
          replacement: 'Partial<HistoryPluginState>',
          start: getNodeStart(node),
        });
        ctx.addedImports.push({
          importKind: 'type',
          importedName: 'HistoryPluginState',
          localName: 'HistoryPluginState',
          targetModule: 'platejs',
        });
      }
    }
    return undefined;
  });

  return {
    code: applyCodemodEdits(source, edits),
    editsCount: edits.length,
  };
};

const extractStaticObjectProps = (
  node: AstNode
): Map<string, AstNode> | null => {
  if (node.type !== 'ObjectExpression') return null;
  const map = new Map<string, AstNode>();
  const properties = (node.properties as AstNode[]) ?? [];
  for (const prop of properties) {
    if (prop.type !== 'ObjectProperty') return null;
    const name = getPropertyName(prop);
    if (!name) return null;
    map.set(name, prop.value as AstNode);
  }
  return map;
};

const runPass2 = (
  source: string,
  ctx: PassContext
): { code: string; editsCount: number } => {
  const ast = parseSource(source, ctx.filePath);
  const bindings = collectPliteImports(ast);
  const edits: CodemodEdit[] = [];

  walkAst(ast, (node, walk) => {
    if (node.type === 'CallExpression') {
      const callee = node.callee as AstNode;
      if (callee.type === 'Identifier') {
        const binding = bindings.get(String(callee.name));
        if (
          binding &&
          !walk.isShadowed(String(callee.name)) &&
          (binding.sourceModule === 'plitejs' ||
            binding.sourceModule === 'plitejs/react') &&
          (binding.importedName === 'createEditor' ||
            binding.importedName === 'useCreateEditor')
        ) {
          const isReactConstructor = binding.sourceModule === 'plitejs/react';
          const args = (node.arguments as AstNode[]) ?? [];
          const optionsArg = args[0];

          if (!optionsArg) {
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                node,
                'warning',
                'implicit-history-default',
                `Plate ${binding.importedName}() installs HistoryPlugin by default (Plite did not).`,
                'Add HistoryPlugin.configure({ enabled: false }) to plugins if undo/redo should stay disabled.'
              )
            );
            return;
          }

          if (optionsArg.type !== 'ObjectExpression') {
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                node,
                'warning',
                'dynamic-editor-options',
                `Non-literal options passed to ${binding.importedName}(); verify history, dom, and authored plugin configuration manually.`
              )
            );
            return;
          }

          const topProps = (optionsArg.properties as AstNode[]) ?? [];
          let pluginsProp: AstNode | null = null;
          let hasClipboardFormatKey = false;
          let hasUserId = false;

          for (const prop of topProps) {
            if (prop.type !== 'ObjectProperty') continue;
            const name = getPropertyName(prop);
            if (name === 'plugins') pluginsProp = prop;
            if (name === 'clipboardFormatKey') hasClipboardFormatKey = true;
            if (name === 'userId') hasUserId = true;
          }

          if (!pluginsProp) {
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                node,
                'warning',
                'implicit-history-default',
                `Plate ${binding.importedName}() installs HistoryPlugin by default (Plite did not).`,
                'Add HistoryPlugin.configure({ enabled: false }) to plugins if undo/redo should stay disabled.'
              )
            );
            return;
          }

          const pluginsValue = pluginsProp.value as AstNode;
          const unwrappedPlugins =
            pluginsValue.type === 'TSAsExpression'
              ? (pluginsValue.expression as AstNode)
              : pluginsValue;

          if (unwrappedPlugins.type !== 'ArrayExpression') {
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                pluginsProp,
                'manual',
                'dynamic-plugins-array',
                'Non-literal plugins array cannot be rewritten automatically for history(), dom(), or authored().'
              )
            );
            return;
          }

          const elements =
            (unwrappedPlugins.elements as Array<AstNode | null>) ?? [];
          let sawHistory = false;
          let installsAuthoredPlugin = false;

          for (const el of elements) {
            if (!el) continue;
            if (el.type === 'Identifier' && el.name === 'AuthoredPlugin') {
              installsAuthoredPlugin = true;
            }
            if (
              el.type === 'CallExpression' &&
              (el.callee as AstNode).type === 'Identifier'
            ) {
              const b = bindings.get(String((el.callee as AstNode).name));
              if (
                b &&
                b.sourceModule === 'plitejs/authored' &&
                b.importedName === 'authored'
              ) {
                const callArgs = (el.arguments as AstNode[]) ?? [];
                if (callArgs.length === 0) {
                  installsAuthoredPlugin = true;
                } else if (callArgs.length === 1 && callArgs[0]) {
                  const staticOpts = extractStaticObjectProps(callArgs[0]);
                  const authorIdOpt = staticOpts?.get('authorId');
                  if (
                    staticOpts &&
                    [...staticOpts.keys()].every((k) => k === 'authorId') &&
                    (!authorIdOpt || authorIdOpt.type === 'StringLiteral')
                  ) {
                    installsAuthoredPlugin = true;
                  }
                }
              }
            }
          }

          const nextPluginItems: string[] = [];
          const hoistedEntries: string[] = [];
          let pluginsChanged = false;

          for (const el of elements) {
            if (!el) continue;
            const rawEl = source.slice(getNodeStart(el), getNodeEnd(el));

            if (el.type === 'Identifier') {
              const b = bindings.get(String(el.name));
              if (
                b &&
                b.sourceModule === 'plitejs/authored' &&
                b.importedName === 'authoredRecords' &&
                !walk.isShadowed(String(el.name))
              ) {
                if (installsAuthoredPlugin) {
                  pluginsChanged = true;
                  continue;
                }
                ctx.diagnostics.push(
                  makeDiagnostic(
                    ctx.filePath,
                    el,
                    'manual',
                    'standalone-authored-records',
                    'Kept authoredRecords because this editor does not install AuthoredPlugin.'
                  )
                );
                nextPluginItems.push(rawEl);
                continue;
              }
              nextPluginItems.push(rawEl);
              continue;
            }

            if (
              el.type !== 'CallExpression' ||
              (el.callee as AstNode).type !== 'Identifier'
            ) {
              nextPluginItems.push(rawEl);
              continue;
            }

            const callCallee = el.callee as AstNode;
            const callName = String(callCallee.name);
            const b = bindings.get(callName);
            if (!b || walk.isShadowed(callName)) {
              nextPluginItems.push(rawEl);
              continue;
            }
            const callArgs = (el.arguments as AstNode[]) ?? [];

            if (
              b.sourceModule === 'plitejs/history' &&
              b.importedName === 'history'
            ) {
              sawHistory = true;
              if (callArgs.length === 0) {
                pluginsChanged = true;
                continue;
              }
              if (callArgs.length === 1 && callArgs[0]) {
                const staticOpts = extractStaticObjectProps(callArgs[0]);
                const allowed = new Set([
                  'enabled',
                  'maxDepth',
                  'newBatchDelay',
                ]);
                if (
                  staticOpts &&
                  [...staticOpts.keys()].every((key) => allowed.has(key))
                ) {
                  if (staticOpts.size === 0) {
                    pluginsChanged = true;
                    continue;
                  }
                  const parts: string[] = [];
                  const enabledVal = staticOpts.get('enabled');
                  if (enabledVal) {
                    parts.push(
                      `enabled: ${source.slice(getNodeStart(enabledVal), getNodeEnd(enabledVal))}`
                    );
                  }
                  const stateParts: string[] = [];
                  for (const stateKey of ['maxDepth', 'newBatchDelay']) {
                    const val = staticOpts.get(stateKey);
                    if (val) {
                      stateParts.push(
                        `${stateKey}: ${source.slice(getNodeStart(val), getNodeEnd(val))}`
                      );
                    }
                  }
                  if (stateParts.length > 0) {
                    parts.push(`initialState: { ${stateParts.join(', ')} }`);
                  }
                  nextPluginItems.push(
                    `HistoryPlugin.configure({ ${parts.join(', ')} })`
                  );
                  ctx.addedImports.push({
                    importKind: 'value',
                    importedName: 'HistoryPlugin',
                    localName: 'HistoryPlugin',
                    targetModule: 'platejs',
                  });
                  pluginsChanged = true;
                  continue;
                }
              }
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  el,
                  'manual',
                  'history-options-manual',
                  'Could not rewrite non-literal history(...) options automatically; migrate to HistoryPlugin.configure(...) manually.'
                )
              );
              nextPluginItems.push(rawEl);
              continue;
            }

            if (b.sourceModule === 'plitejs/dom' && b.importedName === 'dom') {
              if (!isReactConstructor) {
                ctx.diagnostics.push(
                  makeDiagnostic(
                    ctx.filePath,
                    el,
                    'manual',
                    'dom-on-headless-editor',
                    'dom() on root createEditor() cannot be hoisted; platejs/react installs DOM support automatically.'
                  )
                );
                nextPluginItems.push(rawEl);
                continue;
              }
              if (callArgs.length === 0) {
                pluginsChanged = true;
                continue;
              }
              if (callArgs.length === 1 && callArgs[0]) {
                const staticOpts = extractStaticObjectProps(callArgs[0]);
                if (
                  staticOpts &&
                  [...staticOpts.keys()].every(
                    (k) => k === 'clipboardFormatKey'
                  )
                ) {
                  const keyVal = staticOpts.get('clipboardFormatKey');
                  if (keyVal) {
                    if (hasClipboardFormatKey) {
                      ctx.diagnostics.push(
                        makeDiagnostic(
                          ctx.filePath,
                          el,
                          'manual',
                          'duplicate-clipboard-format-key',
                          'clipboardFormatKey is already set on editor options; resolve duplicate dom({ clipboardFormatKey }) manually.'
                        )
                      );
                      nextPluginItems.push(rawEl);
                      continue;
                    }
                    hasClipboardFormatKey = true;
                    hoistedEntries.push(
                      `clipboardFormatKey: ${source.slice(getNodeStart(keyVal), getNodeEnd(keyVal))}`
                    );
                  }
                  pluginsChanged = true;
                  continue;
                }
              }
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  el,
                  'manual',
                  'dom-options-manual',
                  'dom(...) options such as clipboard: false or dynamic values cannot be hoisted automatically.'
                )
              );
              nextPluginItems.push(rawEl);
              continue;
            }

            if (
              b.sourceModule === 'plitejs/authored' &&
              b.importedName === 'authored'
            ) {
              if (callArgs.length === 0) {
                nextPluginItems.push('AuthoredPlugin');
                ctx.addedImports.push({
                  importKind: 'value',
                  importedName: 'AuthoredPlugin',
                  localName: 'AuthoredPlugin',
                  targetModule: 'platejs/authored',
                });
                pluginsChanged = true;
                continue;
              }
              if (callArgs.length === 1 && callArgs[0]) {
                const staticOpts = extractStaticObjectProps(callArgs[0]);
                if (
                  staticOpts &&
                  [...staticOpts.keys()].every((k) => k === 'authorId')
                ) {
                  const authorIdVal = staticOpts.get('authorId');
                  if (!authorIdVal) {
                    nextPluginItems.push('AuthoredPlugin');
                    ctx.addedImports.push({
                      importKind: 'value',
                      importedName: 'AuthoredPlugin',
                      localName: 'AuthoredPlugin',
                      targetModule: 'platejs/authored',
                    });
                    pluginsChanged = true;
                    continue;
                  }
                  if (authorIdVal.type === 'StringLiteral') {
                    if (hasUserId) {
                      ctx.diagnostics.push(
                        makeDiagnostic(
                          ctx.filePath,
                          el,
                          'manual',
                          'duplicate-user-id',
                          'userId is already set on editor options; resolve authored({ authorId }) manually.'
                        )
                      );
                      nextPluginItems.push(rawEl);
                      continue;
                    }
                    hasUserId = true;
                    hoistedEntries.push(
                      `userId: ${source.slice(getNodeStart(authorIdVal), getNodeEnd(authorIdVal))}`
                    );
                    nextPluginItems.push('AuthoredPlugin');
                    ctx.addedImports.push({
                      importKind: 'value',
                      importedName: 'AuthoredPlugin',
                      localName: 'AuthoredPlugin',
                      targetModule: 'platejs/authored',
                    });
                    pluginsChanged = true;
                    continue;
                  }
                }
              }
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  el,
                  'manual',
                  'authored-options-manual',
                  'Dynamic or function authorId in authored(...) cannot be hoisted to static userId; use AuthoredPlugin with createEditorView({ authorId }) or userId.'
                )
              );
              nextPluginItems.push(rawEl);
              continue;
            }

            nextPluginItems.push(rawEl);
          }

          if (!sawHistory) {
            ctx.diagnostics.push(
              makeDiagnostic(
                ctx.filePath,
                node,
                'warning',
                'implicit-history-default',
                `Plate ${binding.importedName}() installs HistoryPlugin by default (Plite did not).`,
                'Add HistoryPlugin.configure({ enabled: false }) to plugins if undo/redo should stay disabled.'
              )
            );
          }

          if (pluginsChanged) {
            const rebuiltProps: string[] = [];
            for (const prop of topProps) {
              if (prop === pluginsProp) {
                if (nextPluginItems.length > 0) {
                  rebuiltProps.push(`plugins: [${nextPluginItems.join(', ')}]`);
                }
                continue;
              }
              rebuiltProps.push(
                source.slice(getNodeStart(prop), getNodeEnd(prop))
              );
            }
            for (const entry of hoistedEntries) rebuiltProps.push(entry);

            const isMultiline = source
              .slice(getNodeStart(optionsArg), getNodeEnd(optionsArg))
              .includes('\n');
            const replacement =
              rebuiltProps.length === 0
                ? '{}'
                : isMultiline
                  ? `{\n  ${rebuiltProps.join(',\n  ')},\n}`
                  : `{ ${rebuiltProps.join(', ')} }`;

            edits.push({
              end: getNodeEnd(optionsArg),
              replacement,
              start: getNodeStart(optionsArg),
            });
          }
        }
      }
    }

    if (node.type === 'JSXElement') {
      const opening = node.openingElement as AstNode;
      const openingName = opening.name as AstNode;
      if (openingName.type === 'JSXIdentifier') {
        const tagName = String(openingName.name);
        const binding = bindings.get(tagName);

        if (
          binding &&
          binding.sourceModule === 'plitejs/react' &&
          binding.importedName === 'EditorRoot' &&
          !walk.isShadowed(tagName)
        ) {
          const attrs = (opening.attributes as AstNode[]) ?? [];
          const rootAttr = attrs.find(
            (attr) =>
              attr.type === 'JSXAttribute' &&
              (attr.name as AstNode).type === 'JSXIdentifier' &&
              (attr.name as AstNode).name === 'root'
          );

          if (rootAttr) {
            const hasSpread = attrs.some(
              (a) => a.type === 'JSXSpreadAttribute'
            );
            const hasObservers = attrs.some(
              (a) =>
                a.type === 'JSXAttribute' &&
                (a.name as AstNode).type === 'JSXIdentifier' &&
                OBSERVER_PROP_NAMES.has(String((a.name as AstNode).name))
            );
            const rawChildren = (node.children as AstNode[]) ?? [];
            const meaningfulChildren = rawChildren.filter(
              (child) =>
                !(
                  child.type === 'JSXText' &&
                  typeof child.value === 'string' &&
                  child.value.trim() === ''
                )
            );
            const soleCandidate = meaningfulChildren[0];
            const soleChild =
              meaningfulChildren.length === 1 &&
              soleCandidate?.type === 'JSXElement'
                ? soleCandidate
                : null;
            const childOpening = soleChild
              ? (soleChild.openingElement as AstNode)
              : null;
            const childNameNode = childOpening
              ? (childOpening.name as AstNode)
              : null;
            const childBinding =
              childNameNode?.type === 'JSXIdentifier'
                ? bindings.get(String(childNameNode.name))
                : undefined;
            const isEditableChild =
              !!childBinding &&
              (childBinding.importedName === 'Editable' ||
                childBinding.importedName === 'PagedEditable' ||
                childBinding.importedName === 'VirtualizedEditable');
            const childAttrs =
              (childOpening?.attributes as AstNode[] | undefined) ?? [];
            const childHasRoot = childAttrs.some(
              (a) =>
                a.type === 'JSXAttribute' &&
                (a.name as AstNode).type === 'JSXIdentifier' &&
                (a.name as AstNode).name === 'root'
            );

            if (
              !hasSpread &&
              !hasObservers &&
              soleChild &&
              childOpening &&
              childNameNode &&
              isEditableChild &&
              !childHasRoot
            ) {
              const rootAttrText = source.slice(
                getNodeStart(rootAttr),
                getNodeEnd(rootAttr)
              );
              let removeStart = getNodeStart(rootAttr);
              while (
                removeStart > getNodeStart(opening) &&
                source[removeStart - 1] === ' '
              ) {
                removeStart -= 1;
              }
              edits.push({
                end: getNodeEnd(rootAttr),
                replacement: '',
                start: removeStart,
              });
              const insertAt = getNodeEnd(childNameNode);
              edits.push({
                end: insertAt,
                replacement: ` ${rootAttrText}`,
                start: insertAt,
              });
            } else {
              ctx.diagnostics.push(
                makeDiagnostic(
                  ctx.filePath,
                  rootAttr,
                  'manual',
                  'editor-root-prop',
                  'Plate EditorRoot does not accept a root prop; move root onto EditorContent and verify hooks/callbacks.'
                )
              );
            }
          }
        }

        const nextName =
          binding &&
          !walk.isShadowed(tagName) &&
          binding.localName === binding.importedName
            ? JSX_COMPONENT_RENAMES[binding.importedName]
            : undefined;
        if (nextName) {
          edits.push({
            end: getNodeEnd(openingName),
            replacement: nextName,
            start: getNodeStart(openingName),
          });
          const closing = node.closingElement as AstNode | null | undefined;
          if (closing && (closing.name as AstNode).type === 'JSXIdentifier') {
            const closingName = closing.name as AstNode;
            edits.push({
              end: getNodeEnd(closingName),
              replacement: nextName,
              start: getNodeStart(closingName),
            });
          }
        }
      }
    }
  });

  return {
    code: applyCodemodEdits(source, edits),
    editsCount: edits.length,
  };
};

type SpecifierEntry = {
  importKind: 'type' | 'value';
  importedName: string;
  localName: string;
};

const formatImportDeclaration = (
  moduleSpecifier: string,
  specs: SpecifierEntry[],
  quote: string
): string => {
  const deduped: SpecifierEntry[] = [];
  const seen = new Set<string>();
  for (const spec of specs) {
    const key = `${spec.importedName}::${spec.localName}`;
    if (seen.has(key)) {
      const existing = deduped.find(
        (item) =>
          item.importedName === spec.importedName &&
          item.localName === spec.localName
      );
      if (existing && spec.importKind === 'value') {
        existing.importKind = 'value';
      }
      continue;
    }
    seen.add(key);
    deduped.push({ ...spec });
  }

  const allTypes = deduped.every((s) => s.importKind === 'type');
  const formatted = deduped
    .sort((a, b) => a.importedName.localeCompare(b.importedName))
    .map((spec) => {
      const prefix = !allTypes && spec.importKind === 'type' ? 'type ' : '';
      return spec.importedName === spec.localName
        ? `${prefix}${spec.importedName}`
        : `${prefix}${spec.importedName} as ${spec.localName}`;
    });

  const prefix = allTypes ? 'import type' : 'import';
  const singleLine = `${prefix} { ${formatted.join(', ')} } from ${quote}${moduleSpecifier}${quote};`;
  if (singleLine.length <= 80) return singleLine;

  return `${prefix} {\n  ${formatted.join(',\n  ')},\n} from ${quote}${moduleSpecifier}${quote};`;
};

const runPass3 = (
  source: string,
  ctx: PassContext
): { code: string; editsCount: number } => {
  const ast = parseSource(source, ctx.filePath);
  const bindings = collectPliteImports(ast);

  const remainingRefCount = new Map<string, number>();
  walkAst(ast, (node, walk) => {
    if (
      isReferenceIdentifier(node, walk.parent, walk.parentKey) &&
      bindings.has(String(node.name)) &&
      !walk.isShadowed(String(node.name))
    ) {
      remainingRefCount.set(
        String(node.name),
        (remainingRefCount.get(String(node.name)) ?? 0) + 1
      );
    }
    if (
      node.type === 'JSXIdentifier' &&
      walk.parent &&
      (walk.parent.type === 'JSXOpeningElement' ||
        walk.parent.type === 'JSXClosingElement') &&
      bindings.has(String(node.name)) &&
      !walk.isShadowed(String(node.name))
    ) {
      remainingRefCount.set(
        String(node.name),
        (remainingRefCount.get(String(node.name)) ?? 0) + 1
      );
    }
  });

  const identifierRenames = new Map<string, string>();
  const program = ast.program as AstNode;
  const body = (program.body as AstNode[]) ?? [];

  const existingPlateImports = new Map<
    string,
    {
      node: AstNode;
      quote: string;
      specifiers: SpecifierEntry[];
    }
  >();

  for (const stmt of body) {
    if (stmt.type !== 'ImportDeclaration') continue;
    const mod = (stmt.source as AstNode).value;
    if (typeof mod !== 'string') continue;
    if (mod !== 'platejs' && !mod.startsWith('platejs/')) continue;
    const rawSpecs = (stmt.specifiers as AstNode[]) ?? [];
    if (
      rawSpecs.length === 0 ||
      rawSpecs.some((s) => s.type !== 'ImportSpecifier')
    ) {
      continue;
    }
    if (existingPlateImports.has(mod)) continue;
    const declKind = stmt.importKind === 'type' ? 'type' : 'value';
    const rawSource = source.slice(
      getNodeStart(stmt.source as AstNode),
      getNodeEnd(stmt.source as AstNode)
    );
    const quote = rawSource.startsWith('"') ? '"' : "'";
    const specifiers: SpecifierEntry[] = rawSpecs.map((spec) => {
      const imported = spec.imported as AstNode;
      const local = spec.local as AstNode;
      return {
        importKind:
          declKind === 'type' || spec.importKind === 'type' ? 'type' : 'value',
        importedName:
          imported.type === 'Identifier'
            ? String(imported.name)
            : String(imported.value),
        localName: String(local.name),
      };
    });
    existingPlateImports.set(mod, { node: stmt, quote, specifiers });
  }

  const edits: CodemodEdit[] = [];
  const mergedAdditions = new Map<string, SpecifierEntry[]>();
  const queueAddition = (targetModule: string, spec: SpecifierEntry) => {
    const list = mergedAdditions.get(targetModule) ?? [];
    list.push(spec);
    mergedAdditions.set(targetModule, list);
  };

  for (const req of ctx.addedImports) {
    queueAddition(req.targetModule, {
      importKind: req.importKind,
      importedName: req.importedName,
      localName: req.localName,
    });
  }

  let firstPliteImportNode: AstNode | null = null;
  let defaultQuote = "'";

  for (const stmt of body) {
    if (
      (stmt.type === 'ExportAllDeclaration' ||
        stmt.type === 'ExportNamedDeclaration') &&
      isAstNode(stmt.source) &&
      typeof stmt.source.value === 'string' &&
      isPliteModule(stmt.source.value)
    ) {
      ctx.diagnostics.push(
        makeDiagnostic(
          ctx.filePath,
          stmt,
          'manual',
          'plite-reexport',
          `Re-export from "${stmt.source.value}" cannot be rewritten safely; update barrel re-exports manually.`
        )
      );
      continue;
    }

    if (stmt.type !== 'ImportDeclaration') continue;
    const sourceNode = stmt.source as AstNode;
    const mod = sourceNode.value;
    if (typeof mod !== 'string' || !isPliteModule(mod)) continue;

    if (!firstPliteImportNode) firstPliteImportNode = stmt;
    const rawSource = source.slice(
      getNodeStart(sourceNode),
      getNodeEnd(sourceNode)
    );
    const quote = rawSource.startsWith('"') ? '"' : "'";
    defaultQuote = quote;

    const rawSpecs = (stmt.specifiers as AstNode[]) ?? [];
    if (rawSpecs.length === 0) {
      ctx.diagnostics.push(
        makeDiagnostic(
          ctx.filePath,
          stmt,
          'manual',
          'side-effect-import',
          `Side-effect import "${mod}" requires manual review.`
        )
      );
      continue;
    }

    if (rawSpecs.some((s) => s.type !== 'ImportSpecifier')) {
      ctx.diagnostics.push(
        makeDiagnostic(
          ctx.filePath,
          stmt,
          'manual',
          'namespace-or-default-import',
          `Namespace or default import from "${mod}" cannot be rewritten safely; convert to named imports manually.`
        )
      );
      continue;
    }

    const declKind = stmt.importKind === 'type' ? 'type' : 'value';
    const keptPliteSpecs: SpecifierEntry[] = [];
    const targetGroups = new Map<string, SpecifierEntry[]>();
    const addLocalGroup = (targetMod: string, spec: SpecifierEntry) => {
      if (existingPlateImports.has(targetMod)) {
        queueAddition(targetMod, spec);
        return;
      }
      const list = targetGroups.get(targetMod) ?? [];
      list.push(spec);
      targetGroups.set(targetMod, list);
    };

    for (const spec of rawSpecs) {
      const imported = spec.imported as AstNode;
      const local = spec.local as AstNode;
      const importedName =
        imported.type === 'Identifier'
          ? String(imported.name)
          : String(imported.value);
      const localName = String(local.name);
      const importKind: 'type' | 'value' =
        declKind === 'type' || spec.importKind === 'type' ? 'type' : 'value';
      const key = `${mod}#${importedName}`;
      const refs = remainingRefCount.get(localName) ?? 0;

      if (
        mod === 'plitejs/react' &&
        LEGACY_PLITE_SHELL_EXPORTS.has(importedName)
      ) {
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            spec,
            'manual',
            'legacy-plite-shell',
            `${importedName} was removed from plitejs/react and collides with Plate's ${importedName}; replace with native elements spreading attributes or migrate to Plate plugins.`
          )
        );
        keptPliteSpecs.push({ importKind, importedName, localName });
        continue;
      }

      if (
        (mod === 'plitejs/dom' &&
          (importedName === 'DOMEditor' || importedName === 'dom')) ||
        (mod === 'plitejs/history' &&
          (importedName === 'history' || importedName === 'HistoryOptions')) ||
        (mod === 'plitejs/authored' &&
          (importedName === 'authored' || importedName === 'authoredRecords'))
      ) {
        if (refs === 0) {
          continue;
        }
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            spec,
            'manual',
            'unrewritten-plite-symbol',
            `Kept "${importedName}" from "${mod}" because ${refs} reference(s) could not be rewritten automatically.`
          )
        );
        keptPliteSpecs.push({ importKind, importedName, localName });
        continue;
      }

      const pliteOnlyMessage = PLITE_ONLY_DIAGNOSTICS[key];
      if (pliteOnlyMessage) {
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            spec,
            'manual',
            importedName === 'isEditor' && mod === 'plitejs/dom'
              ? 'dom-is-editor-collision'
              : 'plite-only-export',
            pliteOnlyMessage
          )
        );
        keptPliteSpecs.push({ importKind, importedName, localName });
        continue;
      }

      const rename = PLITE_TO_PLATE_SYMBOL_RENAMES[key];
      if (rename) {
        const isUnaliased = localName === importedName;
        const nextLocalName = isUnaliased ? rename.targetName : localName;
        if (isUnaliased && nextLocalName !== localName) {
          identifierRenames.set(localName, nextLocalName);
        }
        addLocalGroup(rename.targetModule, {
          importKind: rename.isTypeOnly ? 'type' : importKind,
          importedName: rename.targetName,
          localName: nextLocalName,
        });
        continue;
      }

      if (mod === 'plitejs/annotations') {
        if (PLITE_ANNOTATION_TYPES.has(importedName)) {
          addLocalGroup('platejs/react', {
            importKind: 'type',
            importedName,
            localName,
          });
          continue;
        }
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            spec,
            'manual',
            'plite-only-export',
            `Kept "${importedName}" from "plitejs/annotations" for manual migration.`
          )
        );
        keptPliteSpecs.push({ importKind, importedName, localName });
        continue;
      }

      const targetModule = PLITE_TO_PLATE_MODULE_MAP[mod];
      if (!targetModule) {
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            spec,
            'manual',
            'unknown-plite-subpath',
            `Subpath "${mod}" has no automatic Plate mapping; migrate manually.`
          )
        );
        keptPliteSpecs.push({ importKind, importedName, localName });
        continue;
      }

      addLocalGroup(targetModule, { importKind, importedName, localName });
    }

    for (const [targetMod, specs] of targetGroups) {
      const queued = mergedAdditions.get(targetMod);
      if (queued) {
        specs.push(...queued);
        mergedAdditions.delete(targetMod);
      }
    }

    const lines: string[] = [];
    for (const [targetMod, specs] of [...targetGroups.entries()].sort(
      ([a], [b]) => a.localeCompare(b)
    )) {
      lines.push(formatImportDeclaration(targetMod, specs, quote));
    }
    if (keptPliteSpecs.length > 0) {
      lines.push(formatImportDeclaration(mod, keptPliteSpecs, quote));
    }

    let replaceEnd = getNodeEnd(stmt);
    if (lines.length === 0 && source[replaceEnd] === '\n') {
      replaceEnd += 1;
    }
    edits.push({
      end: replaceEnd,
      replacement: lines.join('\n'),
      start: getNodeStart(stmt),
    });
  }

  const unmergedNewImports: string[] = [];
  for (const [targetMod, specs] of [...mergedAdditions.entries()].sort(
    ([a], [b]) => a.localeCompare(b)
  )) {
    const existing = existingPlateImports.get(targetMod);
    if (existing) {
      const combined = [...existing.specifiers, ...specs];
      edits.push({
        end: getNodeEnd(existing.node),
        replacement: formatImportDeclaration(
          targetMod,
          combined,
          existing.quote
        ),
        start: getNodeStart(existing.node),
      });
    } else {
      unmergedNewImports.push(
        formatImportDeclaration(targetMod, specs, defaultQuote)
      );
    }
  }

  if (unmergedNewImports.length > 0) {
    if (firstPliteImportNode) {
      const targetStart = getNodeStart(firstPliteImportNode);
      const existingEdit = edits.find((e) => e.start === targetStart);
      if (existingEdit) {
        const prefix = `${unmergedNewImports.join('\n')}\n`;
        const idx = edits.indexOf(existingEdit);
        edits[idx] = {
          ...existingEdit,
          replacement: existingEdit.replacement
            ? `${prefix}${existingEdit.replacement}`
            : prefix,
        };
      } else {
        edits.push({
          end: targetStart,
          replacement: `${unmergedNewImports.join('\n')}\n`,
          start: targetStart,
        });
      }
    } else {
      edits.push({
        end: 0,
        replacement: `${unmergedNewImports.join('\n')}\n`,
        start: 0,
      });
    }
  }

  if (identifierRenames.size > 0) {
    walkAst(ast, (node, walk) => {
      if (
        isReferenceIdentifier(node, walk.parent, walk.parentKey) &&
        !walk.isShadowed(String(node.name))
      ) {
        const nextName = identifierRenames.get(String(node.name));
        if (nextName) {
          edits.push({
            end: getNodeEnd(node),
            replacement: nextName,
            start: getNodeStart(node),
          });
        }
      }
    });
  }

  walkAst(ast, (node) => {
    if (node.type === 'CallExpression') {
      const callee = node.callee as AstNode;
      const args = (node.arguments as AstNode[]) ?? [];
      if (
        (callee.type === 'Import' ||
          (callee.type === 'Identifier' && callee.name === 'require')) &&
        args[0]?.type === 'StringLiteral' &&
        typeof args[0].value === 'string' &&
        isPliteModule(args[0].value)
      ) {
        ctx.diagnostics.push(
          makeDiagnostic(
            ctx.filePath,
            node,
            'manual',
            'dynamic-plite-import',
            `Dynamic import/require of "${args[0].value}" requires manual migration.`
          )
        );
      }
    }
  });

  return {
    code: applyCodemodEdits(source, edits),
    editsCount: edits.length,
  };
};

const runPass4 = (
  source: string,
  ctx: PassContext
): { code: string; editsCount: number } => {
  const ast = parseSource(source, ctx.filePath);
  const edits: CodemodEdit[] = [];
  const emittedTodoKeys = new Set<string>();

  const scheduleTodo = (
    node: AstNode,
    ancestors: AstNode[],
    kind: CodemodDiagnostic['kind'],
    code: string,
    message: string,
    hint?: string
  ) => {
    ctx.diagnostics.push(
      makeDiagnostic(ctx.filePath, node, kind, code, message, hint)
    );
    const { inJsxChildren, target } = findEnclosingStatementOrJsx(
      ancestors,
      node
    );
    const targetStart = getNodeStart(target);
    const dedupKey = `${targetStart}:${code}`;
    if (emittedTodoKeys.has(dedupKey)) return;
    emittedTodoKeys.add(dedupKey);

    const edit = buildTodoCommentEdit(
      source,
      targetStart,
      inJsxChildren,
      code,
      hint ? `${message} ${hint}` : message
    );
    if (edit) edits.push(edit);
  };

  walkAst(ast, (node, walk) => {
    if (node.type === 'JSXAttribute') {
      const attrName = (node.name as AstNode).name;
      if (typeof attrName !== 'string') return;
      const opening = walk.ancestors.at(-1);
      const tagName =
        opening?.type === 'JSXOpeningElement' &&
        (opening.name as AstNode).type === 'JSXIdentifier'
          ? String((opening.name as AstNode).name)
          : '';

      if (
        RENDER_PROP_DIAGNOSTIC_NAMES.has(attrName) &&
        (tagName === 'EditorContent' ||
          tagName === 'Editable' ||
          tagName === 'PagedEditorContent' ||
          tagName === 'VirtualizedEditorContent')
      ) {
        scheduleTodo(
          node,
          walk.ancestors,
          'scaffold',
          `render-prop-${attrName}`,
          `Migrate ${attrName} on <${tagName}> to Plate plugin renderers (definePlugin render.node / render.leaf / EditorElement / EditorLeaf).`
        );
      }

      if (attrName === 'decorations' && tagName === 'EditorRoot') {
        scheduleTodo(
          node,
          walk.ancestors,
          'scaffold',
          'editor-root-decorations',
          'Plate EditorRoot does not accept decorations; move decoration sources to plugin decorate().'
        );
      }

      if (attrName === 'onValueChange' && tagName === 'EditorRoot') {
        const valueExpr = (node.value as AstNode | null)?.expression as
          | AstNode
          | undefined;
        if (
          valueExpr &&
          (valueExpr.type === 'ArrowFunctionExpression' ||
            valueExpr.type === 'FunctionExpression')
        ) {
          const params = (valueExpr.params as AstNode[]) ?? [];
          let valueBindingName: string | null = null;
          if (params[0]?.type === 'ObjectPattern') {
            for (const prop of (params[0].properties as AstNode[]) ?? []) {
              if (
                prop.type === 'ObjectProperty' &&
                getPropertyName(prop) === 'value' &&
                (prop.value as AstNode).type === 'Identifier'
              ) {
                valueBindingName = String((prop.value as AstNode).name);
              }
            }
          }
          if (valueBindingName) {
            let foundArrayUsage = false;
            walkAst(valueExpr.body as AstNode, (inner) => {
              if (foundArrayUsage) return false;
              if (
                inner.type === 'MemberExpression' &&
                (inner.object as AstNode).type === 'Identifier' &&
                (inner.object as AstNode).name === valueBindingName
              ) {
                const prop = inner.property as AstNode;
                if (
                  (!inner.computed &&
                    prop.type === 'Identifier' &&
                    LEGACY_ARRAY_METHODS.has(String(prop.name))) ||
                  (inner.computed && prop.type === 'NumericLiteral')
                ) {
                  foundArrayUsage = true;
                }
              }
              const firstCallArg = (
                inner.arguments as AstNode[] | undefined
              )?.[0];
              if (
                inner.type === 'CallExpression' &&
                (inner.callee as AstNode).type === 'MemberExpression' &&
                ((inner.callee as AstNode).object as AstNode).name ===
                  'Array' &&
                ((inner.callee as AstNode).property as AstNode).name ===
                  'isArray' &&
                firstCallArg?.type === 'Identifier' &&
                firstCallArg.name === valueBindingName
              ) {
                foundArrayUsage = true;
              }
              return undefined;
            });
            if (foundArrayUsage) {
              scheduleTodo(
                node,
                walk.ancestors,
                'manual',
                'legacy-array-on-value-change',
                'onValueChange now emits EditorDocumentValue ({ children, roots?, meta?, records? }), not a block array; read value.children instead.'
              );
            }
          }
        }
      }
    }

    if (node.type === 'CallExpression') {
      const callee = node.callee as AstNode;
      const args = (node.arguments as AstNode[]) ?? [];
      if (
        callee.type === 'Identifier' &&
        callee.name === 'defineEditorSchema'
      ) {
        const schemaObj = args.find((arg) => arg.type === 'ObjectExpression');
        if (schemaObj) {
          const props = (schemaObj.properties as AstNode[]) ?? [];
          const hasElements = props.some(
            (p) =>
              p.type === 'ObjectProperty' && getPropertyName(p) === 'elements'
          );
          const hasProperties = props.some(
            (p) =>
              p.type === 'ObjectProperty' && getPropertyName(p) === 'properties'
          );
          const hasRecords = props.some(
            (p) =>
              p.type === 'ObjectProperty' && getPropertyName(p) === 'records'
          );
          if (hasElements || hasProperties || hasRecords) {
            scheduleTodo(
              node,
              walk.ancestors,
              'scaffold',
              'schema-to-plugins',
              'Migrate defineEditorSchema elements/properties/records into definePlugin(..., { node, schema }) definitions and run `npx @platejs/cli generate`.'
            );
          }
        }
      }

      if (
        callee.type === 'Identifier' &&
        (callee.name === 'useEditorSelector' ||
          callee.name === 'useEditorState')
      ) {
        const optArg = args[1];
        if (optArg?.type === 'ObjectExpression') {
          const deferredProp = ((optArg.properties as AstNode[]) ?? []).find(
            (p) =>
              p.type === 'ObjectProperty' && getPropertyName(p) === 'deferred'
          );
          if (deferredProp) {
            scheduleTodo(
              deferredProp,
              walk.ancestors,
              'manual',
              'selector-deferred-option',
              'Plate useEditorSelector/useEditorState does not accept `deferred`; wrap the selector output with React useDeferredValue instead.'
            );
          }
        }
      }

      if (callee.type === 'Identifier' && callee.name === 'definePluginSlot') {
        scheduleTodo(
          node,
          walk.ancestors,
          'manual',
          'dynamic-plugin-slot',
          'Verify definePluginSlot usage against Plate plugin configuration/extensions.'
        );
      }
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        (callee.property as AstNode).type === 'Identifier' &&
        ((callee.property as AstNode).name === 'install' ||
          (callee.property as AstNode).name === 'reconfigure')
      ) {
        const methodName = String((callee.property as AstNode).name);
        scheduleTodo(
          node,
          walk.ancestors,
          'warning',
          'dynamic-plugin-lifecycle',
          `Verify runtime .${methodName}() calls when migrating to Plate plugins.`
        );
      }
    }

    if (node.type === 'TSTypeReference') {
      const typeName = node.typeName as AstNode;
      if (
        typeName.type === 'Identifier' &&
        CONTEXT_GENERIC_TYPES.has(String(typeName.name)) &&
        isAstNode(node.typeParameters)
      ) {
        const params = (node.typeParameters.params as AstNode[]) ?? [];
        const firstParam = params[0];
        const looksLikeValueType =
          params.length > 1 ||
          firstParam?.type === 'TSArrayType' ||
          (firstParam?.type === 'TSTypeReference' &&
            (firstParam.typeName as AstNode).type === 'Identifier' &&
            /Value$/i.test(String((firstParam.typeName as AstNode).name)));

        if (looksLikeValueType) {
          const contextTypeName = String(typeName.name);
          scheduleTodo(
            node,
            walk.ancestors,
            'manual',
            'context-generic-editor-type',
            `${contextTypeName}<E> expects an editor type (such as ${contextTypeName}<typeof editor>), not a value array type.`
          );
        }
      }
    }
  });

  const mergedByOffset = new Map<number, string>();
  for (const edit of edits) {
    const existing = mergedByOffset.get(edit.start);
    mergedByOffset.set(
      edit.start,
      existing ? `${existing}${edit.replacement}` : edit.replacement
    );
  }
  const mergedEdits: CodemodEdit[] = [...mergedByOffset.entries()].map(
    ([offset, replacement]) => ({
      end: offset,
      replacement,
      start: offset,
    })
  );

  return {
    code: applyCodemodEdits(source, mergedEdits),
    editsCount: mergedEdits.length,
  };
};

export const transformPliteToPlate = ({
  filePath,
  source,
}: CodemodTransformOptions): CodemodTransformResult => {
  if (!QUICK_PLITE_CHECK.test(source)) {
    return {
      changed: false,
      code: source,
      diagnostics: [],
      editsApplied: 0,
      skipped: true,
    };
  }

  const ctx: PassContext = {
    addedImports: [],
    diagnostics: [],
    filePath,
  };

  let current = source;
  let totalEdits = 0;

  const p1 = runPass1(current, ctx);
  current = p1.code;
  totalEdits += p1.editsCount;

  const p2 = runPass2(current, ctx);
  current = p2.code;
  totalEdits += p2.editsCount;

  const p3 = runPass3(current, ctx);
  current = p3.code;
  totalEdits += p3.editsCount;

  const p4 = runPass4(current, ctx);
  current = p4.code;
  totalEdits += p4.editsCount;

  const changed = current !== source;

  if (changed) {
    // Reparse guard: never emit syntactically invalid code.
    try {
      parseSource(current, filePath);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Codemod produced invalid syntax for ${filePath}; refusing to write (${reason}).`,
        { cause: error }
      );
    }
  }

  return {
    changed,
    code: current,
    diagnostics: ctx.diagnostics,
    editsApplied: totalEdits,
  };
};

export const pliteToPlateCodemod: CodemodDefinition = {
  description:
    'Migrate a Plite React codebase to Plate (imports, EditorContent, DOMEditor -> editor.api.dom, history/dom/authored plugins, and structured TODOs).',
  id: 'plite-to-plate',
  transform: transformPliteToPlate,
  updatesPackageJson: true,
};
