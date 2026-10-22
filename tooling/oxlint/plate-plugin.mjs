import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FAST_TEST_TIMEOUT_MS } from '../config/test-suites.mjs';
import { privatePackageNamePattern } from '../scripts/finalize-plate-declarations.mjs';
import { lineIdentity, readBaseline } from '../scripts/finding-baseline.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export const baselineFile = 'tooling/oxlint/plate-baseline.json';

const baseline = readBaseline(baselineFile);

/** The environment `plate-baseline.mjs` lints with to count every instance. */
export const reportAllEnv = { PLATE_LINT_BASELINE: 'report-all' };

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
      description: 'A test keeps the 5,000 ms default deadline.',
    },
    messages: {
      raised:
        'This test raises its deadline to {{ms}} ms (baselined in this file: {{baselined}}). Make the case cheaper; a raised deadline hides a slow case.',
    },
    type: 'problem',
  },
};

const READERS = new Set(['file', 'readFile', 'readFileSync']);

const SOURCE_FILE = /\.(?:c|m)?[jt]sx?$/u;

const NOT_SOURCE = /\.d\.[cm]?ts$|\.generated\./u;

const SOURCE_DIR = /(?:^|\/)src(?:\/|$)/u;

const resolvedVariable = (context, identifier) =>
  context.sourceCode
    .getScope(identifier)
    .references.find((reference) => reference.identifier === identifier)
    ?.resolved;

const laterWrites = (variable) =>
  variable?.references.filter(
    (reference) => reference.isWrite() && !reference.init
  ) ?? [];

const writtenValues = (context, identifier) => {
  const variable = resolvedVariable(context, identifier);
  const [definition] = variable?.defs ?? [];

  return [
    definition?.type === 'FunctionName'
      ? definition.node
      : definition?.type === 'Variable'
        ? definition.node.init
        : undefined,
    ...laterWrites(variable).map((reference) => reference.writeExpr),
  ].filter(Boolean);
};

// Every string a node can contribute, with each value a binding is ever given
// joined in, so the gate fails closed on any write. Each node is read once.
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
    return writtenValues(context, node).flatMap((value) =>
      stringParts(value, context, seen)
    );
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

const chainRoot = (node) =>
  node?.type === 'MemberExpression' ? chainRoot(node.object) : node;

const matcherOf = (node) => {
  const { callee } = node;
  if (callee.type !== 'MemberExpression' || callee.computed) return null;
  const root = chainRoot(callee.object);
  if (root?.type !== 'CallExpression') return null;
  return calleeName(root.callee) === 'expect'
    ? { expectCall: root, name: callee.property.name }
    : null;
};

const EXISTENCE_MATCHERS = new Set(['toBeDefined', 'toBeTruthy']);

const NOT_A_TEST = new Set([
  'afterAll',
  'afterEach',
  'beforeAll',
  'beforeEach',
  'describe',
  'step',
]);

const calleeMembers = (callee) =>
  callee?.type === 'MemberExpression'
    ? [
        ...calleeMembers(callee.object),
        staticKeyName(callee.property, callee.computed),
      ]
    : callee?.type === 'CallExpression'
      ? calleeMembers(callee.callee)
      : [];

const isTestCall = (node) => {
  const name = calleeName(node.callee);
  return (
    (name === 'it' || name === 'test') &&
    isFunction(node.arguments.at(-1)) &&
    !calleeMembers(node.callee).some((member) => NOT_A_TEST.has(member))
  );
};

// A call such as `expectSelection(editor, ...)` or `assert.equal(...)` asserts
// in a way this rule cannot read, and Testing Library's `getBy*` and `findBy*`
// queries throw unless their element renders, so the test is not judged.
const ASSERTING_CALLEE = /^(?:assert|expect|getBy|getAllBy|findBy|findAllBy)/u;

const assertsElsewhere = (callee) => {
  const name = calleeName(callee);
  if (name === 'expect') return false;
  if (ASSERTING_CALLEE.test(name ?? '')) return true;
  return (
    callee.type === 'MemberExpression' &&
    ASSERTING_CALLEE.test(staticKeyName(callee.property, callee.computed) ?? '')
  );
};

const noExistenceOnlyTest = {
  create(context) {
    const tests = [];
    return {
      CallExpression(node) {
        if (isTestCall(node)) {
          tests.push({ judged: true, node, weak: 0 });
          return;
        }
        const test = tests.at(-1);
        if (!test) return;
        const matcher = matcherOf(node);
        if (matcher && EXISTENCE_MATCHERS.has(matcher.name)) test.weak += 1;
        else if (matcher || assertsElsewhere(node.callee)) test.judged = false;
      },
      'CallExpression:exit'(node) {
        if (tests.at(-1)?.node !== node) return;
        const test = tests.pop();
        if (!test.judged || test.weak === 0) return;
        context.report({ messageId: 'existence', node });
      },
      ThrowStatement() {
        const test = tests.at(-1);
        if (test) test.judged = false;
      },
    };
  },
  meta: {
    docs: {
      description:
        'A test asserts a value, not only that something exists or is truthy.',
    },
    messages: {
      existence:
        'Every assertion in this test is `toBeDefined` or `toBeTruthy` (baselined in this file: {{baselined}}), which passes for almost any wrong value. Assert the value users observe, or cut the test when another one already does.',
    },
    type: 'problem',
  },
};

const SNAPSHOT_MATCHERS = new Set([
  'toHaveScreenshot',
  'toMatchAriaSnapshot',
  'toMatchFileSnapshot',
  'toMatchInlineSnapshot',
  'toMatchSnapshot',
  'toThrowErrorMatchingInlineSnapshot',
  'toThrowErrorMatchingSnapshot',
]);

const noSnapshot = {
  create(context) {
    return {
      CallExpression(node) {
        const matcher = matcherOf(node);
        if (!matcher || !SNAPSHOT_MATCHERS.has(matcher.name)) return;
        context.report({
          data: { matcher: matcher.name },
          messageId: 'snapshot',
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description: 'Tests assert named values, never a recorded snapshot.',
    },
    messages: {
      snapshot:
        '`{{matcher}}` approves whatever the code produced when it was recorded (baselined in this file: {{baselined}}). Assert the values the behavior promises, so the test fails for a named defect and not on every change.',
    },
    type: 'problem',
  },
};

const isZero = (node) => node?.type === 'Literal' && node.value === 0;

const isPromiseResolve = (context, identifier) => {
  const [definition] = resolvedVariable(context, identifier)?.defs ?? [];
  const executor = definition?.type === 'Parameter' ? definition.node : null;
  const promise = executor?.parent;
  return (
    executor?.params[0] === definition.name &&
    promise?.type === 'NewExpression' &&
    promise.callee.type === 'Identifier' &&
    promise.callee.name === 'Promise' &&
    promise.arguments[0] === executor
  );
};

const noFixedSleep = {
  create(context) {
    const report = (node, delay) =>
      context.report({
        data: { delay: context.sourceCode.getText(delay) },
        messageId: 'sleep',
        node,
      });
    return {
      CallExpression(node) {
        const { callee } = node;
        const name =
          callee.type === 'Identifier'
            ? callee.name
            : callee.type === 'MemberExpression'
              ? staticKeyName(callee.property, callee.computed)
              : null;
        const [first, second] = node.arguments;
        if (name === 'waitForTimeout' && first && !isZero(first)) {
          report(node, first);
        }
        if (
          name === 'setTimeout' &&
          first?.type === 'Identifier' &&
          second &&
          !isZero(second) &&
          isPromiseResolve(context, first)
        ) {
          report(node, second);
        }
      },
    };
  },
  meta: {
    docs: {
      description: 'A browser spec waits for a state, never a fixed time.',
    },
    messages: {
      sleep:
        'This browser spec sleeps a fixed {{delay}} ms (baselined in this file: {{baselined}}). Wait for the state the next step needs, such as a web-first `expect` or `page.waitForFunction`; a fixed sleep flakes on a loaded host and wastes time on an idle one.',
    },
    type: 'problem',
  },
};

const CLOCK_READ = /\b(?:performance\.now|Date\.now|process\.hrtime)\b/u;

const BOUND_MATCHERS = new Set([
  'toBeGreaterThan',
  'toBeGreaterThanOrEqual',
  'toBeLessThan',
  'toBeLessThanOrEqual',
]);

const ORDERINGS = new Set(['<', '<=', '>', '>=']);

const childNodes = (node) =>
  Object.entries(node).flatMap(([key, value]) =>
    key === 'parent'
      ? []
      : (Array.isArray(value) ? value : [value]).filter(
          (child) => typeof child?.type === 'string'
        )
  );

const referencedIdentifiers = (node) => {
  if (node.type === 'Identifier') return [node];
  if (node.type === 'MemberExpression') {
    return [
      ...referencedIdentifiers(node.object),
      ...(node.computed ? referencedIdentifiers(node.property) : []),
    ];
  }
  return childNodes(node).flatMap(referencedIdentifiers);
};

const isFunctionValue = (node) =>
  isFunction(node) || node.type === 'FunctionDeclaration';

const returnedValues = (node) => {
  if (node.type === 'ReturnStatement') return [node.argument].filter(Boolean);
  if (isFunctionValue(node)) return [];
  return childNodes(node).flatMap(returnedValues);
};

// Whether a value reads the clock, directly or through what a binding it names
// is ever given, such as `const elapsed = performance.now() - start`. A named
// function counts by what it returns, so a helper that only times its steps
// does not mark every value it returns.
const readsClock = (node, context, seen = new Set()) => {
  if (!node || seen.has(node)) return false;
  seen.add(node);
  if (isFunctionValue(node)) {
    const values =
      node.body.type === 'BlockStatement'
        ? childNodes(node.body).flatMap(returnedValues)
        : [node.body];
    return values.some((value) => readsClock(value, context, seen));
  }
  if (CLOCK_READ.test(context.sourceCode.getText(node))) return true;
  return referencedIdentifiers(node).some((identifier) =>
    writtenValues(context, identifier).some((value) =>
      readsClock(value, context, seen)
    )
  );
};

const noWallClockBound = {
  create(context) {
    return {
      CallExpression(node) {
        const matcher = matcherOf(node);
        if (!matcher) return;
        const [actual] = matcher.expectCall.arguments;
        const bounded = BOUND_MATCHERS.has(matcher.name)
          ? [actual, node.arguments[0]]
          : actual?.type === 'BinaryExpression' &&
              ORDERINGS.has(actual.operator)
            ? [actual]
            : [];
        if (!bounded.some((value) => readsClock(value, context))) return;
        context.report({ messageId: 'wallClock', node });
      },
    };
  },
  meta: {
    docs: {
      description:
        'A blocking test asserts correctness and work counts, never elapsed time.',
    },
    messages: {
      wallClock:
        'This test bounds elapsed wall-clock time (baselined in this file: {{baselined}}), which flakes on a loaded host and passes a slow change on a fast one. Count the work instead, or move the budget to a benchmark lane that asserts it only under `BENCH_MEASURE=1`.',
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

const noPliteJsdoc = {
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
            continue;
          }
          const match = privatePackageNamePattern.exec(comment.value);
          if (!match) continue;
          const mentionStart = comment.range[0] + '/*'.length + match.index;
          context.report({
            messageId: 'named',
            node: { range: [mentionStart, mentionStart + match[0].length] },
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'JSDoc in platejs source never names Plite, because the build copies it into the published declarations.',
    },
    messages: {
      named:
        'This JSDoc names Plite (baselined in this file: {{baselined}}). The platejs build copies JSDoc into its published declarations, where `tooling/scripts/finalize-plate-declarations.mjs` refuses any Plite mention at `pnpm build`. Describe the behavior without naming the private layer.',
    },
    type: 'problem',
  },
};

const memberName = (node) => {
  if (node?.type !== 'MemberExpression') return null;
  if (!node.computed) return node.property.name;
  return typeof node.property.value === 'string' ? node.property.value : null;
};

// `a?.b`, `a!` and the `a` of `a ?? {}` all read the value `a`.
const readValue = (node) => {
  if (
    node?.type === 'ChainExpression' ||
    node?.type === 'TSNonNullExpression'
  ) {
    return readValue(node.expression);
  }
  if (node?.type === 'LogicalExpression' && node.operator !== '&&') {
    return readValue(node.left);
  }
  return node;
};

// A content program's fixed slots and child counts decide where children fit;
// `allowsText` alone classifies a node and places nothing.
const PLACEMENT_FIELDS = new Set(['max', 'min', 'prefix']);

const propertyKey = (property) =>
  property.type === 'Property'
    ? (property.key.name ?? property.key.value)
    : undefined;

// The value one const binds to an identifier, with the key it was
// destructured from, if any.
const constBinding = (context, identifier) => {
  const variable = resolvedVariable(context, identifier);
  if (!variable || laterWrites(variable).length > 0) return null;
  const [definition] = variable.defs;
  if (definition?.type !== 'Variable') return null;
  const { id, init } = definition.node;
  if (id.type === 'Identifier') return { init, key: undefined };
  if (id.type !== 'ObjectPattern') return null;
  const property = id.properties.find(
    (candidate) =>
      candidate.type === 'Property' &&
      candidate.value.range[0] === definition.name.range[0]
  );

  return property ? { init, key: propertyKey(property) } : null;
};

const noSchemaPlacementCopy = {
  create(context) {
    const isSchema = (node, depth) => {
      const value = readValue(node);
      if (memberName(value) === 'schema') return true;
      if (value?.type === 'CallExpression') {
        return (
          value.callee.type === 'Identifier' &&
          value.callee.name === 'getEditorSchema'
        );
      }
      if (value?.type !== 'Identifier') return false;
      if (value.name === 'schema') return true;
      if (depth > 4) return false;
      const binding = constBinding(context, value);
      if (!binding) return false;

      return (
        binding.key === 'schema' ||
        (binding.key === undefined && isSchema(binding.init, depth + 1))
      );
    };
    const isSpec = (node, depth = 0) => {
      const value = readValue(node);
      if (
        value?.type === 'CallExpression' &&
        memberName(value.callee) === 'element' &&
        isSchema(value.callee.object, depth)
      ) {
        return true;
      }
      if (value?.type !== 'Identifier' || depth > 4) return false;
      const binding = constBinding(context, value);

      return binding?.key === undefined && isSpec(binding?.init, depth + 1);
    };
    const isProgram = (node, depth = 0) => {
      let value = readValue(node);
      // `parent && spec.content` is the content program whenever it is read.
      while (value?.type === 'LogicalExpression' && value.operator === '&&') {
        value = readValue(value.right);
      }
      if (memberName(value) === 'content') return isSpec(value.object, depth);
      if (value?.type !== 'Identifier' || depth > 4) return false;
      const binding = constBinding(context, value);
      if (!binding) return false;

      return binding.key === 'content'
        ? isSpec(binding.init, depth + 1)
        : binding.key === undefined && isProgram(binding.init, depth + 1);
    };
    const report = (node) => context.report({ messageId: 'copy', node });

    return {
      MemberExpression(node) {
        if (PLACEMENT_FIELDS.has(memberName(node)) && isProgram(node.object)) {
          report(node);
        }
      },
      VariableDeclarator({ id, init }) {
        if (id.type !== 'ObjectPattern' || !isProgram(init)) return;
        for (const property of id.properties) {
          if (PLACEMENT_FIELDS.has(propertyKey(property))) report(property);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Code outside plitejs asks Plite where children fit instead of re-deriving it from a content program.',
    },
    messages: {
      copy: "This reads a content program's prefix, min or max (baselined in this file: {{baselined}}) to decide where children fit, which copies Plite's placement law. `canPlaceAt` in packages/plitejs/src/core/editor-schema.ts owns it. Land through Plite's slice fitter, which runs it, or add a public placement read there.",
    },
    type: 'problem',
  },
};

const POINT_FIELDS = new Set(['anchor', 'focus']);
const COMPARISONS = new Set(['===', '!==', '==', '!=']);

const noSelectionRootCopy = {
  create(context) {
    const equalityOperands = new Set();
    const isPoint = (node) => POINT_FIELDS.has(memberName(readValue(node)));
    const reportRoots = (pattern) => {
      for (const property of pattern.properties) {
        if (propertyKey(property) === 'root') {
          context.report({ messageId: 'copy', node: property });
        }
      }
    };

    return {
      BinaryExpression({ left, operator, right }) {
        if (!COMPARISONS.has(operator)) return;
        equalityOperands.add(readValue(left));
        equalityOperands.add(readValue(right));
      },
      MemberExpression(node) {
        if (
          memberName(node) === 'root' &&
          isPoint(node.object) &&
          !equalityOperands.has(node)
        ) {
          context.report({ messageId: 'copy', node });
        }
      },
      VariableDeclarator({ id, init }) {
        if (id.type !== 'ObjectPattern') return;
        if (isPoint(init)) reportRoots(id);
        for (const property of id.properties) {
          if (
            POINT_FIELDS.has(propertyKey(property)) &&
            property.value.type === 'ObjectPattern'
          ) {
            reportRoots(property.value);
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Code outside plitejs asks Plite which root a selection edits instead of reading it from the selection's points.",
    },
    messages: {
      copy: "This reads a selection's root from its anchor or focus (baselined in this file: {{baselined}}), which copies Plite's root rule. `SelectionApi.root` in packages/plitejs/src/interfaces/selection.ts owns it: it takes the root either point names and refuses a range whose points name different roots. Call `SelectionApi.root(range)`.",
    },
    type: 'problem',
  },
};

const STRUCTURAL_MARK_KINDS = new Set(['join', 'split', 'unwrap', 'wrap']);

const noStructuralMarkCopy = {
  create(context) {
    const typeLiterals = new Set();

    return {
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          STRUCTURAL_MARK_KINDS.has(node.value) &&
          !typeLiterals.has(node)
        ) {
          context.report({
            data: { kind: node.value },
            messageId: 'copy',
            node,
          });
        }
      },
      TemplateLiteral(node) {
        const kind = node.quasis[0].value.cooked;
        if (
          node.expressions.length === 0 &&
          STRUCTURAL_MARK_KINDS.has(kind) &&
          !typeLiterals.has(node)
        ) {
          context.report({ data: { kind }, messageId: 'copy', node });
        }
      },
      TSLiteralType(node) {
        typeLiterals.add(node.literal);
      },
    };
  },
  meta: {
    docs: {
      description:
        'Authored review tree code asks the resolver what a structural mark does instead of re-deriving it.',
    },
    messages: {
      copy: "This reads a pending '{{kind}}' mark (baselined in this file: {{baselined}}), which copies the resolver's structural rules. `resolveAuthoredChildren` and `survivalUnder` in packages/plitejs/src/authored/tree/resolve.ts own them. Call or extend that owner instead of re-deriving them here.",
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

const returnedLiteral = (fn) => {
  if (
    fn?.type !== 'ArrowFunctionExpression' &&
    fn?.type !== 'FunctionDeclaration' &&
    fn?.type !== 'FunctionExpression'
  ) {
    return undefined;
  }
  if (fn.body.type === 'Literal') return fn.body.value;
  const [statement] = fn.body.body ?? [];
  return statement?.type === 'ReturnStatement' &&
    statement.argument?.type === 'Literal'
    ? statement.argument.value
    : undefined;
};

const noInlineHydrationFlag = {
  create(context) {
    // A hydration flag is a literal snapshot, so a binding given more than one
    // value is not one.
    const snapshot = (node) => {
      if (node?.type !== 'Identifier') return returnedLiteral(node);
      const values = writtenValues(context, node);

      return values.length === 1 ? returnedLiteral(values[0]) : undefined;
    };

    return {
      CallExpression(node) {
        const { callee } = node;
        const name =
          callee.type === 'MemberExpression'
            ? callee.property.name
            : callee.name;
        if (name !== 'useSyncExternalStore') return;
        if (
          snapshot(node.arguments[1]) !== true ||
          snapshot(node.arguments[2]) !== false
        ) {
          return;
        }
        context.report({ messageId: 'inline', node });
      },
    };
  },
  meta: {
    docs: {
      description: 'Plite reads hydration through its one useHydrated hook.',
    },
    messages: {
      inline:
        'This is the hydration flag. Call `useHydrated` from packages/plitejs/src/react/hooks/use-hydrated.ts instead of another client-true, server-false snapshot pair.',
    },
    type: 'problem',
  },
};

const PLITE_TOKENS = new Set(['plite', 'plitejs']);

const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/u;

const COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo']);

const wordTokens = (word) =>
  word
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')
    .replace(/([A-Za-z])([0-9])/gu, '$1 $2')
    .split(' ');

const WORD = /[A-Za-z0-9]+/gu;

const isProseWord = (text, start, end) =>
  !/[-_:/$.@]/u.test(text[start - 1] ?? '') &&
  !/[-_:/$]/u.test(text[end] ?? '') &&
  !(text[end] === '.' && /[A-Za-z0-9]/u.test(text[end + 1] ?? ''));

const isRegistryName = (text, start, end) =>
  text.slice(start - 1, end + 1) === '@plate/';

const textBrand = (text, inPlite) => {
  for (const { 0: word, index: start } of text.matchAll(WORD)) {
    const end = start + word.length;
    const lower = word.toLowerCase();
    if (lower === 'platejs' || isRegistryName(text, start, end)) continue;
    const tokens = wordTokens(word).map((token) => token.toLowerCase());
    if (tokens.some((token) => PLITE_TOKENS.has(token))) return 'Plite';
    if (
      tokens.includes('plate') &&
      (inPlite || word !== 'Plate' || !isProseWord(text, start, end))
    ) {
      return 'Plate';
    }
  }
  return null;
};

const nameBrand = (name, inPlite) => {
  const tokens = (name.match(WORD) ?? [])
    .flatMap(wordTokens)
    .map((token) => token.toLowerCase());
  if (tokens.some((token) => PLITE_TOKENS.has(token))) return 'Plite';
  if (inPlite && tokens.includes('plate')) return 'Plate';
  return null;
};

const MODULE_SOURCE_PARENTS = new Set([
  'ExportAllDeclaration',
  'ExportNamedDeclaration',
  'ImportDeclaration',
  'ImportExpression',
  'TSExternalModuleReference',
  'TSImportType',
  'TSModuleDeclaration',
]);

const isRequire = (callee) =>
  callee.name === 'require' ||
  (memberName(callee) === 'resolve' && callee.object.name === 'require');

const isModuleSpecifier = (literal) => {
  const { parent } = literal;
  return (
    MODULE_SOURCE_PARENTS.has(parent?.type) ||
    (parent?.type === 'CallExpression' &&
      parent.arguments[0] === literal &&
      isRequire(parent.callee))
  );
};

const isProcessEnv = (node) =>
  memberName(node) === 'env' &&
  node.object.type === 'Identifier' &&
  node.object.name === 'process';

const isComponentInit = (init) => {
  if (isFunction(init)) return true;
  if (init?.type !== 'CallExpression') return false;
  const name =
    init.callee.type === 'MemberExpression'
      ? memberName(init.callee)
      : init.callee.name;
  return COMPONENT_WRAPPERS.has(name);
};

const noBrandedValue = {
  create(context) {
    const inPlite = relativeFilename(context).startsWith('packages/plitejs/');
    const reportText = (node, text) => {
      const brand = textBrand(text, inPlite);
      if (brand) context.report({ data: { brand }, messageId: 'text', node });
    };
    const reportName = (node, name) => {
      const brand = nameBrand(name, inPlite);
      if (brand) context.report({ data: { brand }, messageId: 'name', node });
    };
    const reportPrefixedName = (node) => {
      if (node?.type === 'Identifier' && node.name.startsWith('__')) {
        reportName(node, node.name);
      }
    };

    return {
      ClassBody(node) {
        for (const member of node.body) {
          if (
            (member.type === 'PropertyDefinition' ||
              member.type === 'AccessorProperty') &&
            !member.computed &&
            !member.declare &&
            member.key.type === 'Identifier'
          ) {
            reportName(member.key, member.key.name);
          }
        }
      },
      FunctionDeclaration({ id }) {
        if (!id) return;
        if (COMPONENT_NAME.test(id.name)) reportName(id, id.name);
        else reportPrefixedName(id);
      },
      FunctionExpression({ id }) {
        if (id && COMPONENT_NAME.test(id.name)) reportName(id, id.name);
      },
      JSXText(node) {
        reportText(node, node.value);
      },
      Literal(node) {
        if (typeof node.value !== 'string' || isModuleSpecifier(node)) return;
        reportText(node, node.value);
      },
      MemberExpression(node) {
        if (node.computed || node.property.type !== 'Identifier') return;
        if (isProcessEnv(node.object)) {
          reportName(node.property, node.property.name);
        } else {
          reportPrefixedName(node.property);
        }
      },
      ObjectExpression(node) {
        for (const property of node.properties) {
          if (
            property.type === 'Property' &&
            !property.computed &&
            property.key.type === 'Identifier'
          ) {
            reportName(property.key, property.key.name);
          }
        }
      },
      TemplateElement(node) {
        reportText(node, node.value.cooked ?? node.value.raw);
      },
      VariableDeclarator({ id, init }) {
        if (id.type !== 'Identifier') return;
        if (COMPONENT_NAME.test(id.name) && isComponentInit(init)) {
          reportName(id, id.name);
        } else {
          reportPrefixedName(id);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Values users can observe, such as stored keys, ids, messages and component names, never name Plite, and name Plate only in Plate prose.',
    },
    messages: {
      name: 'This name reaches users and names {{brand}} (baselined in this file: {{baselined}}). Give it a neutral name for its job; package names and Plate prose are the only places the brand appears.',
      text: 'This value reaches users and names {{brand}} (baselined in this file: {{baselined}}). Give it a neutral name for its job; `platejs`, `@plate/<item>` and the word "Plate" in Plate prose are the only places the brand appears.',
    },
    type: 'problem',
  },
};

const STRICT_DOM_LOOKUP_RESOLVERS = {
  assertDOMNode:
    'resolveDOMNode(node), or editable() for the editor root, and handle null',
  assertDOMPoint: 'resolveDOMPoint(point) and handle null',
  assertDOMRange: 'resolveDOMRange(range) and handle null',
  assertDocumentOrShadowRoot: 'resolveDocumentOrShadowRoot() and handle null',
  assertEventRange: 'resolveEventRange(event) and handle null',
  assertNode: 'resolveNode(domNode) and handle null',
  assertPath: 'resolvePath(node) and handle null',
  assertPoint: 'resolvePoint(domPoint, options) and handle null',
  assertRange: 'resolveRange(domRange, options) and handle null',
  findKey:
    'resolveDOMNode(node) when it needs the DOM node, or editor.key(path) when it needs the node key, and handle null',
};

const isStrictLookup = (name) =>
  Object.hasOwn(STRICT_DOM_LOOKUP_RESOLVERS, name ?? '');

const staticKeyName = (key, computed) => {
  if (!computed) return key.name ?? key.value;
  if (typeof key.value === 'string') return key.value;
  return key.type === 'TemplateLiteral' && key.expressions.length === 0
    ? key.quasis[0].value.cooked
    : null;
};

const staticPropertyName = (property) =>
  property.type === 'Property'
    ? staticKeyName(property.key, property.computed)
    : null;

const strictNamedForwarderCallee = (property) => {
  const body = isFunction(property.value) ? property.value.body : null;
  return isStrictLookup(staticPropertyName(property)) &&
    body?.type === 'CallExpression'
    ? body.callee
    : null;
};

const noStrictDOMLookup = {
  create(context) {
    const forwarders = new Set();
    const report = (node, name) =>
      context.report({
        data: { resolver: STRICT_DOM_LOOKUP_RESOLVERS[name] },
        messageId: 'strict',
        node,
      });

    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee.type === 'Identifier' && isStrictLookup(callee.name)) {
          report(callee, callee.name);
        }
      },
      MemberExpression(node) {
        const name = staticKeyName(node.property, node.computed);
        if (isStrictLookup(name) && !forwarders.has(node)) report(node, name);
      },
      ObjectPattern(node) {
        for (const property of node.properties) {
          const name = staticPropertyName(property);
          if (isStrictLookup(name)) report(property, name);
        }
      },
      Property(node) {
        const callee = strictNamedForwarderCallee(node);
        if (callee) forwarders.add(callee);
      },
    };
  },
  meta: {
    docs: {
      description:
        'Plite and Plate runtime code reads the DOM through a lookup that returns null, never a strict one that throws.',
    },
    messages: {
      strict:
        'Plite and Plate runtime code never calls a strict DOM lookup, which throws while DOM is missing. Use {{resolver}}.',
    },
    type: 'problem',
  },
};

const EDITABLE_DIR = 'packages/plitejs/src/react/editable/';

const TEST_PATH = /\.(?:spec|test)\.|\/__tests__\//u;

const EDITOR_WIDE_CALLS = new Set([
  'findEditorDOMRootRuntime',
  'resolveLastEditorWindow',
]);

const EDITOR_WIDE_MAPS = new Set([
  'EDITOR_TO_DOM_EDITABLE',
  'EDITOR_TO_ELEMENT',
  'EDITOR_TO_WINDOW',
]);

const SELF_REGISTRATION_WRITES = new Set(['delete', 'set']);

const VIEW_WIDE_MEMBERS = new Set([
  'deselect',
  'editable',
  'getWindow',
  'resolveDocumentOrShadowRoot',
  'root',
  'scroll',
]);

const VIEW_WIDE_WHEN_NODE_IS_EDITOR = new Set([
  'assertDOMNode',
  'resolveDOMNode',
]);

const propertyName = ({ computed, property }) => {
  if (!computed) return property.name;
  return typeof property.value === 'string' ? property.value : null;
};

const isApiDom = (node) =>
  node.type === 'MemberExpression' &&
  !node.computed &&
  node.property.name === 'dom' &&
  node.object.type === 'MemberExpression' &&
  !node.object.computed &&
  node.object.property.name === 'api';

const viewWideReceiver = (object) => {
  if (
    object.type === 'Identifier' &&
    (object.name === 'DOMEditor' || object.name === 'ReactEditor')
  ) {
    return object.name;
  }
  return isApiDom(object) ? 'api.dom' : null;
};

const editableOwnDOMTree = {
  create(context) {
    const file = relativeFilename(context);
    if (!file.startsWith(EDITABLE_DIR) || TEST_PATH.test(file)) return {};

    const report = (node, lookup) =>
      context.report({ data: { lookup }, messageId: 'editorWide', node });
    const source = (node) =>
      node && context.sourceCode.text.slice(...node.range);

    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee.type === 'Identifier') {
          const [, element] = node.arguments;
          if (EDITOR_WIDE_CALLS.has(callee.name)) {
            report(callee, callee.name);
          } else if (
            callee.name === 'getMountedEditableDOMRuntime' &&
            (!element || source(element) === 'undefined')
          ) {
            report(callee, 'getMountedEditableDOMRuntime(editor)');
          }
          return;
        }
        if (callee.type !== 'MemberExpression') return;
        const receiver = viewWideReceiver(callee.object);
        const name = propertyName(callee);
        if (!receiver || !name) return;
        const [first, second] = node.arguments;
        const [editorArgument, nodeArgument] =
          receiver === 'api.dom'
            ? [callee.object.object.object, first]
            : [first, second];
        if (
          VIEW_WIDE_MEMBERS.has(name) ||
          (VIEW_WIDE_WHEN_NODE_IS_EDITOR.has(name) &&
            nodeArgument &&
            source(nodeArgument) === source(editorArgument))
        ) {
          report(callee, `${receiver}.${name}`);
        }
      },
      MemberExpression(node) {
        const { object, property } = node;
        if (
          object.type === 'Identifier' &&
          EDITOR_WIDE_MAPS.has(object.name) &&
          (node.computed || !SELF_REGISTRATION_WRITES.has(property.name))
        ) {
          report(node, object.name);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Code under the Editable reads its own DOM tree, not a lookup that answers for the editor's whole view.",
    },
    messages: {
      editorWide:
        "`{{lookup}}` answers for the editor's whole view, whose Editables share focus and selection (baselined in this file: {{baselined}}). Read this Editable's own element, such as the event's `currentTarget` or the runtime's `rootRef`, or its runtime from `findMountedEditableDOMRuntime(element)`.",
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
    'editable-own-dom-tree': withBaseline(
      'editable-own-dom-tree',
      editableOwnDOMTree
    ),
    'exception-format': exceptionFormat,
    'mock-spreads-module': withBaseline(
      'mock-spreads-module',
      mockSpreadsModule
    ),
    'no-annotated-inferred-callback': noAnnotatedInferredCallback,
    'no-as-never': withBaseline('no-as-never', noAsNever),
    'no-branded-value': withBaseline('no-branded-value', noBrandedValue),
    'no-existence-only-test': withBaseline(
      'no-existence-only-test',
      noExistenceOnlyTest
    ),
    'no-fixed-sleep': withBaseline('no-fixed-sleep', noFixedSleep),
    'no-inline-hydration-flag': noInlineHydrationFlag,
    'no-one-off-editor-type': withBaseline(
      'no-one-off-editor-type',
      noOneOffEditorType
    ),
    'no-plite-jsdoc': withBaseline('no-plite-jsdoc', noPliteJsdoc),
    'no-raised-test-timeout': withBaseline(
      'no-raised-test-timeout',
      noRaisedTestTimeout
    ),
    'no-relative-plite-source': withBaseline(
      'no-relative-plite-source',
      noRelativePliteSource
    ),
    'no-schema-placement-copy': withBaseline(
      'no-schema-placement-copy',
      noSchemaPlacementCopy
    ),
    'no-second-name': withBaseline('no-second-name', noSecondName),
    'no-selection-root-copy': withBaseline(
      'no-selection-root-copy',
      noSelectionRootCopy
    ),
    'no-snapshot': withBaseline('no-snapshot', noSnapshot),
    'no-source-text-test': withBaseline(
      'no-source-text-test',
      noSourceTextTest
    ),
    'no-strict-dom-lookup': noStrictDOMLookup,
    'no-structural-mark-copy': withBaseline(
      'no-structural-mark-copy',
      noStructuralMarkCopy
    ),
    'no-wall-clock-bound': withBaseline(
      'no-wall-clock-bound',
      noWallClockBound
    ),
  },
};
