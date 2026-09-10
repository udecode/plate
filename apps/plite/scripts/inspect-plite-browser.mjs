#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

import { inspectAppBuild } from './build-app-if-stale.mjs';
import { inspectBrowserBuild } from './build-browser-if-stale.mjs';
import { appRoot, repoRoot } from './plite-proof-inputs.mjs';

const registryFile =
  'apps/www/src/app/(app)/examples/plite/plite-example-registry.ts';
const parseSource = (source) =>
  parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'comments', 'tokens'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
};
const literal = (node) =>
  node?.type === 'StringLiteral'
    ? node.value
    : node?.type === 'TemplateLiteral' && node.expressions.length === 0
      ? node.quasis[0].value.cooked
      : null;
const callName = (node) =>
  node?.type === 'Identifier'
    ? node.name
    : node?.type === 'MemberExpression'
      ? `${callName(node.object)}.${node.property.name}`
      : '';
const unwrap = (node) =>
  ['TSAsExpression', 'TSSatisfiesExpression'].includes(node?.type)
    ? unwrap(node.expression)
    : node;

export const discoverExampleJourneys = ({ registrySource, files }) => {
  let definitions;
  let hidden = [];
  walk(parseSource(registrySource), (node) => {
    if (node.type !== 'VariableDeclarator') return;
    const value = unwrap(node.init);
    if (node.id.name === 'EXAMPLE_NAMES_AND_PATHS') {
      definitions = value.elements.map((row) => row.elements.map(literal));
    }
    if (node.id.name === 'HIDDEN_EXAMPLES') {
      hidden = value.elements.map(literal);
    }
  });
  if (
    !definitions?.length ||
    definitions.some(([name, route]) => !name || !route)
  ) {
    throw new Error('Cannot read canonical Plite example definitions');
  }
  const entries = new Map(
    definitions.map(([name, slug]) => [
      slug,
      {
        name,
        slug,
        route: `/examples/plite/${slug}`,
        hidden: hidden.includes(slug),
        journeys: [],
      },
    ])
  );
  const unresolved = [];
  for (const { file, source } of files) {
    const ast = parseSource(source);
    const pointer = (node) => ({
      file,
      line: node.loc.start.line,
      source: source.slice(node.start, node.end),
    });
    const bindingsIn = (node, inherited = new Map()) => {
      const bindings = new Map(inherited);
      for (const statement of node.body ?? []) {
        if (statement.type === 'FunctionDeclaration') {
          bindings.set(statement.id.name, statement);
        }
        if (statement.type === 'VariableDeclaration') {
          for (const declaration of statement.declarations) {
            if (declaration.id.type === 'Identifier') {
              bindings.set(declaration.id.name, declaration.init);
            }
          }
        }
      }
      return bindings;
    };
    const routes = (node, inheritedBindings) => {
      const found = new Set();
      const bindings = new Map(inheritedBindings);
      walk(node, (child) => {
        if (
          child.type === 'VariableDeclarator' &&
          child.id.type === 'Identifier'
        ) {
          bindings.set(child.id.name, child.init);
        }
      });
      const visited = new Set();
      const routeValue = (argument, seen = new Set()) => {
        if (!argument || seen.has(argument)) return null;
        seen.add(argument);
        if (argument.type === 'Identifier') {
          return routeValue(bindings.get(argument.name), seen);
        }
        if (
          argument.type === 'CallExpression' &&
          argument.callee.type === 'Identifier'
        ) {
          const fn = bindings.get(argument.callee.name);
          if (
            fn?.type === 'ArrowFunctionExpression' &&
            fn.body.type !== 'BlockStatement'
          ) {
            return routeValue(fn.body, seen);
          }
        }
        if (argument.type === 'TemplateLiteral') {
          const prefix = argument.quasis[0].value.cooked;
          if (/[?#]/.test(prefix)) return prefix;
        }
        return literal(argument);
      };
      const scan = (target) =>
        walk(target, (child) => {
          if (child.type !== 'CallExpression') return;
          const name = callName(child.callee);
          if (bindings.has(name) && !visited.has(name)) {
            visited.add(name);
            scan(bindings.get(name));
          }
          if (!name.endsWith('.goto') && name !== 'openExample') return;
          for (const argument of child.arguments) {
            const value = routeValue(argument);
            const match = value?.match(
              /^(?:\/examples\/)?plite\/([^?#/]+)(?:[?#].*)?$/
            );
            if (match && entries.has(match[1])) found.add(match[1]);
          }
        });
      scan(node);
      return [...found];
    };
    const suite = (
      node,
      inherited = [],
      inheritedConfiguration = [],
      suites = [],
      inheritedBindings = new Map()
    ) => {
      const bindings = bindingsIn(node, inheritedBindings);
      const calls = [];
      const scan = (part) => {
        if (!part || typeof part !== 'object') return;
        if (
          part.type === 'CallExpression' &&
          /^test(?:\.|$)/.test(callName(part.callee))
        ) {
          calls.push(part);
          return;
        }
        for (const [key, value] of Object.entries(part)) {
          if (['loc', 'comments', 'tokens'].includes(key)) continue;
          if (Array.isArray(value)) value.forEach(scan);
          else if (value && typeof value === 'object') scan(value);
        }
      };
      scan(node);
      const hooks = [
        ...inherited,
        ...calls.filter((call) =>
          /^test\.(?:beforeEach|beforeAll|afterEach|afterAll)$/.test(
            callName(call.callee)
          )
        ),
      ];
      const configuration = [
        ...inheritedConfiguration,
        ...calls.filter(
          (call) =>
            /^test\.(?:use|describe\.configure|setTimeout|skip|fixme|fail|slow)$/.test(
              callName(call.callee)
            ) &&
            !call.arguments.some((argument) =>
              ['ArrowFunctionExpression', 'FunctionExpression'].includes(
                argument.type
              )
            )
        ),
      ];
      for (const call of calls) {
        const name = callName(call.callee);
        const callback = call.arguments.find((arg) =>
          ['ArrowFunctionExpression', 'FunctionExpression'].includes(arg.type)
        );
        if (/^test\.describe(?:\.|$)/.test(name)) {
          if (callback) {
            const details = call.arguments.find(
              (argument) => argument.type === 'ObjectExpression'
            );
            suite(
              callback.body,
              hooks,
              configuration,
              [
                ...suites,
                {
                  title: literal(call.arguments[0]),
                  mode: name,
                  file,
                  line: call.loc.start.line,
                  details: details ? pointer(details) : null,
                },
              ],
              bindings
            );
          }
          continue;
        }
        if (!/^test(?:\.(?:only|skip|fixme|fail))?$/.test(name) || !callback) {
          continue;
        }
        const title = literal(call.arguments[0]);
        const directRoutes = routes(callback, bindings);
        const slugs = directRoutes.length
          ? directRoutes
          : [...new Set(hooks.flatMap((hook) => routes(hook, bindings)))];
        if (!title || slugs.length === 0) {
          unresolved.push({
            file,
            line: call.loc.start.line,
            reason: !title
              ? 'Dynamic title; use Playwright discovery'
              : 'No literal route in this case or its hooks',
          });
          continue;
        }
        const helpers = new Map();
        const findHelpers = (target) =>
          walk(target, (child) => {
            if (child.type !== 'CallExpression') return;
            const binding = bindings.get(callName(child.callee));
            if (binding && !helpers.has(binding)) {
              helpers.set(binding, pointer(binding));
              findHelpers(binding);
            }
          });
        findHelpers(call);
        hooks.forEach(findHelpers);
        const recipe = {
          title,
          ...pointer(call),
          hooks: hooks.map(pointer),
          helpers: [...helpers.values()],
          configuration: configuration.map(pointer),
          suiteModes: suites.map(({ mode }) => mode),
          suites,
          declaredMode: name,
          command: [
            'pnpm',
            '--filter',
            'plite',
            'test:plite-browser:chromium',
            `${file.replace(/^apps\/plite\//, '')}:${call.loc.start.line}`,
          ],
        };
        for (const slug of slugs) entries.get(slug).journeys.push(recipe);
      }
    };
    suite(ast.program);
  }
  return { entries: [...entries.values()], unresolved };
};

const testFiles = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory()
        ? testFiles(file)
        : /\.(?:test|spec)\.tsx?$/.test(entry.name)
          ? [file]
          : [];
    });

const main = () => {
  const [mode = 'journeys', slug, ...args] = process.argv.slice(2);
  if (mode === '--help') {
    console.log(
      'inspect-plite-browser.mjs journeys [example-path] [--case <title substring>] | doctor\nRead-only JSON. Journey source is the existing registry and test/hook bodies. Discovery is not proof; dynamic cases are reported explicitly. Doctor checks local build identity, not a running browser or authentication.'
    );
    return;
  }
  if (mode === 'doctor') {
    if (slug || args.length) throw new Error('doctor accepts no arguments');
    const app = inspectAppBuild();
    const browser = inspectBrowserBuild();
    console.log(
      JSON.stringify(
        {
          repoRoot,
          node: process.version,
          requiredNode: fs
            .readFileSync(path.join(repoRoot, '.nvmrc'), 'utf-8')
            .trim(),
          app: { fresh: app.fresh, inputDigest: app.inputDigest },
          browser: { fresh: browser.fresh, inputDigest: browser.inputDigest },
          browserSession: 'not inspected',
          next:
            app.fresh && browser.fresh
              ? 'Run the selected managed proof; verify any external server identity separately.'
              : 'The selected managed browser proof will prepare stale artifacts before execution.',
        },
        null,
        2
      )
    );
    return;
  }
  if (
    mode !== 'journeys' ||
    (args.length && (args.length !== 2 || args[0] !== '--case'))
  ) {
    throw new Error('Use --help for valid arguments');
  }
  const result = discoverExampleJourneys({
    registrySource: fs.readFileSync(path.join(repoRoot, registryFile), 'utf-8'),
    files: testFiles(path.join(appRoot, 'tests/plite-browser')).map((file) => ({
      file: path.relative(repoRoot, file),
      source: fs.readFileSync(file, 'utf-8'),
    })),
  });
  const selected = slug
    ? result.entries.filter((entry) => entry.slug === slug)
    : result.entries;
  if (!selected.length) throw new Error(`Unknown example: ${slug}`);
  const caseQuery = args[1];
  let matchingCases = 0;
  const entries = selected.map((entry) => {
    const journeys = entry.journeys.filter(
      (journey) => !caseQuery || journey.title.includes(caseQuery)
    );
    matchingCases += journeys.length;
    const status = entry.journeys.length
      ? 'source recipes found; not executed'
      : 'gap: no statically resolved recipe';
    if (!slug) {
      return {
        name: entry.name,
        slug: entry.slug,
        route: entry.route,
        hidden: entry.hidden,
        status,
        journeyCount: journeys.length,
        proofFiles: [...new Set(journeys.map((journey) => journey.file))],
      };
    }
    return {
      ...entry,
      status,
      journeys: journeys.map(
        ({ source, hooks, helpers, configuration, ...journey }) => ({
          ...journey,
          ...(caseQuery
            ? { source, hooks, helpers, configuration }
            : {
                hooks: hooks.map(({ source: ignored, ...hook }) => hook),
                helpers: helpers.map(
                  ({ source: ignored, ...helper }) => helper
                ),
                configuration: configuration.map(
                  ({ source: ignored, ...setting }) => setting
                ),
              }),
        })
      ),
    };
  });
  if (caseQuery && !matchingCases) {
    throw new Error(`No journey title matches: ${caseQuery}`);
  }
  const selectedFiles = new Set(
    selected.flatMap((entry) => entry.journeys.map((journey) => journey.file))
  );
  console.log(
    JSON.stringify(
      {
        registry: registryFile,
        entries,
        unresolved: slug
          ? result.unresolved.filter((row) => selectedFiles.has(row.file))
          : result.unresolved,
        unresolvedTotal: result.unresolved.length,
        note: 'Static discovery only. Read the case, hooks, configuration, suite modes and helpers for prerequisites, actions, expected effects, skips and cleanup; imported helpers remain owned by their source. Dynamic cases require Playwright discovery. Run the returned argv through the managed runner for actual proof.',
      },
      null,
      2
    )
  );
};

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
