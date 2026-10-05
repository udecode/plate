import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { lineIdentity, readBaseline } from '../scripts/finding-baseline.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export const baselineFile = 'tooling/oxlint/plate-baseline.json';

const baseline = readBaseline(baselineFile);

/** The environment `plate-baseline.mjs` lints with to count every instance. */
export const reportAllEnv = { PLATE_LINT_BASELINE: 'report-all' };

const FAST_TEST_TIMEOUT_MS = 5000;

const INFERRING_METHODS = new Set(['read', 'transaction', 'update']);

const INFERRING_HOOKS = new Set([
  'useEditorSelector',
  'useElementSelector',
  'usePluginOption',
]);

const TEST_CALLEES = new Set(['bench', 'describe', 'it', 'test']);

const STRUCTURAL_WRAPPERS = new Set([
  'Omit',
  'Partial',
  'Pick',
  'Readonly',
  'Required',
]);

const EXCEPTION_HORIZON_DAYS = 90;

// ISO dates order correctly as text.
const isoDay = (date) => date.toISOString().slice(0, 10);

const EXCEPTION_SUFFIX =
  /--\s*\S.*;\s*expires\s+(\d{4}-\d{2}-\d{2})\s*;\s*approved\s+\S+/u;

const DISABLE_DIRECTIVE =
  /^\s*(?:oxlint|eslint)-disable(-next-line|-line)?\b(.*)$/su;

const relativeFilename = (context) =>
  path.relative(repoRoot, context.filename).split(path.sep).join('/');

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// Lines a `plate/<rule>` disable directive covers. oxlint suppresses those
// reports itself, so they never consume a baseline entry.
const exceptedLines = (context, ruleName) => {
  const { text } = context.sourceCode;
  const lines = new Set();
  for (const comment of context.sourceCode.getAllComments()) {
    const directive = DISABLE_DIRECTIVE.exec(comment.value);
    if (!directive?.[2].includes(`plate/${ruleName}`)) continue;
    const line = lineOf(text, comment.range[1]);
    lines.add(directive[1] === '-next-line' ? line + 1 : line);
  }
  return lines;
};

export const withBaseline = (ruleName, rule, entries = baseline) => ({
  ...rule,
  baselined: true,
  create(context) {
    if (process.env.PLATE_LINT_BASELINE === reportAllEnv.PLATE_LINT_BASELINE) {
      return rule.create(context);
    }

    const listed =
      entries[`plate/${ruleName}`]?.[relativeFilename(context)] ?? [];
    const found = [];
    const descriptors = Object.getOwnPropertyDescriptors(context);
    descriptors.report = {
      ...descriptors.report,
      value: (descriptor) => found.push(descriptor),
    };
    const visitors = rule.create(
      Object.create(Object.getPrototypeOf(context), descriptors)
    );
    const exit = visitors['Program:exit'];

    return {
      ...visitors,
      'Program:exit'(node) {
        exit?.(node);
        const { text } = context.sourceCode;
        const excepted = exceptedLines(context, ruleName);
        const unlisted = [...listed];
        for (const descriptor of found) {
          const line = lineOf(text, descriptor.node.range[0]);
          const index = excepted.has(line)
            ? -1
            : unlisted.indexOf(lineIdentity(text, line));
          if (index !== -1) {
            unlisted.splice(index, 1);
            continue;
          }
          context.report({
            ...descriptor,
            data: { ...descriptor.data, baselined: String(listed.length) },
          });
        }
      },
    };
  },
});

const numericValue = (node) => {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'number') {
    return node.value;
  }
  if (node.type === 'BinaryExpression' && node.operator === '*') {
    const left = numericValue(node.left);
    const right = numericValue(node.right);
    return left === null || right === null ? null : left * right;
  }
  return null;
};

const calleeName = (callee) => {
  if (callee?.type === 'Identifier') return callee.name;
  if (callee?.type === 'MemberExpression') return calleeName(callee.object);
  if (callee?.type === 'CallExpression') return calleeName(callee.callee);
  return null;
};

const annotatedParams = (fn) =>
  fn.params.filter(
    (param) =>
      param.typeAnnotation ||
      (param.type === 'AssignmentPattern' && param.left.typeAnnotation) ||
      (param.type === 'RestElement' && param.typeAnnotation)
  );

const isFunction = (node) =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression';

// A `@ts-expect-error` on the line above proves an annotation is rejected,
// which AGENTS.md keeps as an intentional type assertion.
const isTypeRejectionAssertion = (context, node) => {
  const { text } = context.sourceCode;
  const lineStart = text.lastIndexOf('\n', node.range[0] - 1);
  const previousLineStart = text.lastIndexOf('\n', lineStart - 1);
  return text
    .slice(previousLineStart + 1, node.range[0])
    .includes('@ts-expect-error');
};

const noAnnotatedInferredCallback = {
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const name =
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          INFERRING_METHODS.has(callee.property.name)
            ? `.${callee.property.name}`
            : callee.type === 'Identifier' && INFERRING_HOOKS.has(callee.name)
              ? callee.name
              : null;
        if (!name) return;

        for (const argument of node.arguments) {
          if (
            !isFunction(argument) ||
            isTypeRejectionAssertion(context, argument)
          ) {
            continue;
          }
          for (const param of annotatedParams(argument)) {
            context.report({
              data: { name },
              messageId: 'annotated',
              node: param,
            });
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Callbacks passed to editor reads, updates and selector hooks infer their parameters.',
    },
    messages: {
      annotated:
        '{{name}} infers this parameter. Remove the annotation; when inference fails, fix the editor or plugin generic at its owner instead of annotating the caller.',
    },
    type: 'problem',
  },
};

// Bun takes the timeout as a trailing number or options object; node:test
// takes the options object before the callback.
const timeoutOf = (node) => {
  for (const argument of node.arguments) {
    if (argument.type !== 'ObjectExpression') continue;
    const property = argument.properties.find(
      (entry) =>
        entry.type === 'Property' &&
        !entry.computed &&
        (entry.key.name ?? entry.key.value) === 'timeout'
    );
    if (property) return { ms: numericValue(property.value), node: property };
  }
  const last = node.arguments.at(-1);
  return node.arguments.length > 1 && last
    ? { ms: numericValue(last), node: last }
    : null;
};

const noRaisedTestTimeout = {
  create(context) {
    return {
      CallExpression(node) {
        const name = calleeName(node.callee);
        let timeout = null;

        const setsDefault =
          node.callee.type === 'MemberExpression'
            ? node.callee.property.name === 'setTimeout' && name === 'jest'
            : name === 'setDefaultTimeout';

        if (TEST_CALLEES.has(name)) {
          timeout = timeoutOf(node);
        } else if (setsDefault) {
          const ms = numericValue(node.arguments[0]);
          timeout = ms === null ? null : { ms, node: node.arguments[0] };
        }

        if (!timeout || timeout.ms === null) return;
        if (timeout.ms <= FAST_TEST_TIMEOUT_MS) return;

        context.report({
          data: { ms: String(timeout.ms) },
          messageId: 'raised',
          node: timeout.node,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        'A test outside a slow lane keeps the 5,000 ms default deadline.',
    },
    messages: {
      raised:
        'This test raises its deadline to {{ms}} ms (baselined in this file: {{baselined}}). Move the case to a `*.slow.*` file or make it cheaper; a raised deadline hides a slow case in the fast lane.',
    },
    type: 'problem',
  },
};

const READERS = new Set(['file', 'readFile', 'readFileSync']);

const SOURCE_FILE = /\.(?:c|m)?[jt]sx?$/u;

const NOT_SOURCE = /\.d\.[cm]?ts$|\.generated\./u;

const SOURCE_DIR = /(?:^|\/)src(?:\/|$)/u;

const stringParts = (node, context, seen = new Set()) => {
  if (!node || seen.has(node)) return [];
  seen.add(node);
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [node.value];
  }
  if (node.type === 'TemplateLiteral') {
    return [
      ...node.quasis.map((quasi) => quasi.value.cooked ?? ''),
      ...node.expressions.flatMap((child) => stringParts(child, context, seen)),
    ];
  }
  if (node.type === 'Identifier') {
    const variable = context.sourceCode
      .getScope(node)
      .references.find((reference) => reference.identifier === node)?.resolved;
    const init = variable?.defs[0]?.node?.init;
    return init ? stringParts(init, context, seen) : [];
  }
  if (node.type === 'CallExpression' || node.type === 'NewExpression') {
    return node.arguments.flatMap((child) => stringParts(child, context, seen));
  }
  if (node.type === 'BinaryExpression') {
    return [
      ...stringParts(node.left, context, seen),
      ...stringParts(node.right, context, seen),
    ];
  }
  if (node.type === 'MemberExpression') {
    return stringParts(node.object, context, seen);
  }
  return [];
};

const readsBesideModule = (context, node) =>
  /\bimport\.meta\.(?:url|dir(?:name)?)\b|\b__dirname\b/u.test(
    context.sourceCode.getText(node)
  );

const noSourceTextTest = {
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const name =
          callee.type === 'Identifier'
            ? callee.name
            : callee.type === 'MemberExpression' && !callee.computed
              ? callee.property.name
              : null;
        if (!READERS.has(name) || node.arguments.length === 0) return;

        const parts = stringParts(node.arguments[0], context);
        const file = parts.find(
          (part) => SOURCE_FILE.test(part) && !NOT_SOURCE.test(part)
        );
        const inSource =
          parts.some((part) => SOURCE_DIR.test(part)) ||
          (readsBesideModule(context, node.arguments[0]) &&
            SOURCE_DIR.test(relativeFilename(context)));
        if (!file || !inSource) return;

        context.report({
          data: { file },
          messageId: 'sourceText',
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description: 'Tests assert behavior, not the text of source files.',
    },
    messages: {
      sourceText:
        'This test reads the source text of `{{file}}` (baselined in this file: {{baselined}}). Assert behavior through the public entry; a static invariant belongs in an oxlint rule or a check script.',
    },
    type: 'problem',
  },
};

const noAsNever = {
  create(context) {
    return {
      TSAsExpression(node) {
        if (node.typeAnnotation.type !== 'TSNeverKeyword') return;
        context.report({ messageId: 'asNever', node });
      },
    };
  },
  meta: {
    docs: {
      description: 'Source widens a callee instead of casting to never.',
    },
    messages: {
      asNever:
        '`as never` silences a callee that rejects this value (baselined in this file: {{baselined}}). Widen the callee parameter, such as a runtime lookup taking the carrier `getEditorRuntimeOwner` takes, instead of casting.',
    },
    type: 'problem',
  },
};

const isStructuralEditorShape = (annotation) => {
  if (!annotation) return false;
  if (annotation.type === 'TSTypeLiteral') return true;
  if (
    annotation.type === 'TSTypeReference' &&
    annotation.typeName.type === 'Identifier' &&
    STRUCTURAL_WRAPPERS.has(annotation.typeName.name)
  ) {
    return true;
  }
  if (annotation.type === 'TSIntersectionType') {
    return annotation.types.some(isStructuralEditorShape);
  }
  return false;
};

const noOneOffEditorType = {
  create(context) {
    const check = (id, shape) => {
      if (!id.name.endsWith('Editor') || !shape) return;
      context.report({
        data: { name: id.name },
        messageId: 'oneOff',
        node: id,
      });
    };

    return {
      TSInterfaceDeclaration(node) {
        check(node.id, (node.extends ?? []).length === 0);
      },
      TSTypeAliasDeclaration(node) {
        check(node.id, isStructuralEditorShape(node.typeAnnotation));
      },
    };
  },
  meta: {
    docs: {
      description:
        'Source uses Editor or a plugin-scoped editor instead of a one-off structural editor type.',
    },
    messages: {
      oneOff:
        '`{{name}}` is a one-off structural editor type (baselined in this file: {{baselined}}). Accept `Editor`, read `editor.plugin(Plugin)`, or pass the domain value.',
    },
    type: 'problem',
  },
};

const noSecondName = {
  create(context) {
    const report = (node, name) =>
      context.report({ data: { name }, messageId: 'alias', node });

    return {
      ExportNamedDeclaration(node) {
        const { declaration } = node;

        if (
          declaration?.type === 'TSTypeAliasDeclaration' &&
          declaration.typeAnnotation.type === 'TSTypeReference' &&
          declaration.typeAnnotation.typeName.type === 'Identifier' &&
          !declaration.typeAnnotation.typeArguments &&
          !declaration.typeParameters &&
          declaration.typeAnnotation.typeName.name !== declaration.id.name &&
          // `Point = BasePoint` is the CustomTypes extension point, not a rename.
          declaration.typeAnnotation.typeName.name !==
            `Base${declaration.id.name}`
        ) {
          report(declaration.id, declaration.typeAnnotation.typeName.name);
        }

        if (declaration?.type === 'VariableDeclaration') {
          for (const declarator of declaration.declarations) {
            if (declarator.init?.type === 'Identifier') {
              report(declarator.id, declarator.init.name);
            }
          }
        }
      },
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (
            comment.type === 'Block' &&
            /@deprecated\b/u.test(comment.value)
          ) {
            report(comment, 'a deprecated export');
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'A rename moves the owner and its callers instead of keeping a second name.',
    },
    messages: {
      alias:
        'Second name for {{name}} (baselined in this file: {{baselined}}). Rename at the owner and migrate callers instead of keeping an alias, shim or @deprecated export.',
    },
    type: 'problem',
  },
};

const PLATE_MODULE = /^(?:platejs|@platejs\/)/u;

const returnedObject = (factory) => {
  if (!isFunction(factory)) return null;
  if (factory.body.type === 'ObjectExpression') return factory.body;
  const last = factory.body.body?.at(-1);
  return last?.type === 'ReturnStatement' &&
    last.argument?.type === 'ObjectExpression'
    ? last.argument
    : null;
};

const mockSpreadsModule = {
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.name !== 'mock' ||
          callee.property.name !== 'module'
        ) {
          return;
        }
        const [specifier, factory] = node.arguments;
        if (typeof specifier?.value !== 'string') return;
        if (!PLATE_MODULE.test(specifier.value)) return;
        const object = returnedObject(factory);
        if (!object) return;
        if (object.properties.some((entry) => entry.type === 'SpreadElement')) {
          return;
        }
        context.report({
          data: { module: specifier.value },
          messageId: 'partial',
          node: specifier,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        'A test that mocks a Plate module spreads the real module into the mock.',
    },
    messages: {
      partial:
        "This mock replaces all of `{{module}}` (baselined in this file: {{baselined}}), so the next export the code under test imports fails to link. Spread the real module first: `import * as actual from '{{module}}'`, then `...actual`.",
    },
    type: 'problem',
  },
};

const PLITE_SOURCE_PATH = /^\.{1,2}\/(?:.*\/)?plitejs\/src(?:\/|$)/u;

const noRelativePliteSource = {
  create(context) {
    const check = (source) => {
      if (typeof source?.value !== 'string') return;
      if (!PLITE_SOURCE_PATH.test(source.value)) return;
      context.report({
        data: { path: source.value },
        messageId: 'relative',
        node: source,
      });
    };

    return {
      ExportAllDeclaration: ({ source }) => check(source),
      ExportNamedDeclaration: ({ source }) => check(source),
      ImportDeclaration: ({ source }) => check(source),
      ImportExpression: ({ source }) => check(source),
    };
  },
  meta: {
    docs: {
      description:
        'Plate source and www reach plitejs through its entrypoints, never a relative source path.',
    },
    messages: {
      relative:
        '`{{path}}` reaches plitejs source by a relative path (baselined in this file: {{baselined}}), which skips the plitejs import ban. Import through a Plate facade bridge, or export the symbol from `plitejs/internal`.',
    },
    type: 'problem',
  },
};

const exceptionFormat = {
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const directive = DISABLE_DIRECTIVE.exec(comment.value);
          if (!directive || !/\bplate\//u.test(directive[2])) continue;

          const date = EXCEPTION_SUFFIX.exec(directive[2])?.[1];
          const expires = date && new Date(`${date}T00:00:00Z`);
          const now = new Date();
          const horizon = new Date(now);
          horizon.setUTCDate(horizon.getUTCDate() + EXCEPTION_HORIZON_DAYS);

          if (
            !expires ||
            Number.isNaN(expires.getTime()) ||
            isoDay(expires) !== date
          ) {
            context.report({ messageId: 'format', node: comment });
          } else if (date < isoDay(now)) {
            context.report({
              data: { date },
              messageId: 'expired',
              node: comment,
            });
          } else if (date > isoDay(horizon)) {
            context.report({
              data: { date, days: String(EXCEPTION_HORIZON_DAYS) },
              messageId: 'tooLong',
              node: comment,
            });
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'An exception to a plate/* rule names its reason, expiry date and approver.',
    },
    messages: {
      expired:
        'This plate/* exception expired on {{date}}. Fix the code, or renew it with a human approver.',
      format:
        'A plate/* exception ends with `-- <reason>; expires <YYYY-MM-DD>; approved <name>`, with a real date.',
      tooLong:
        'This plate/* exception runs to {{date}}; an exception lasts at most {{days}} days.',
    },
    type: 'problem',
  },
};

export { noAsNever };

export default {
  meta: {
    name: 'plate',
  },
  rules: {
    'exception-format': exceptionFormat,
    'mock-spreads-module': withBaseline(
      'mock-spreads-module',
      mockSpreadsModule
    ),
    'no-annotated-inferred-callback': noAnnotatedInferredCallback,
    'no-as-never': withBaseline('no-as-never', noAsNever),
    'no-one-off-editor-type': withBaseline(
      'no-one-off-editor-type',
      noOneOffEditorType
    ),
    'no-raised-test-timeout': withBaseline(
      'no-raised-test-timeout',
      noRaisedTestTimeout
    ),
    'no-relative-plite-source': withBaseline(
      'no-relative-plite-source',
      noRelativePliteSource
    ),
    'no-second-name': withBaseline('no-second-name', noSecondName),
    'no-source-text-test': withBaseline(
      'no-source-text-test',
      noSourceTextTest
    ),
  },
};
