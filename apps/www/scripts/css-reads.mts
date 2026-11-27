import postcss, { AtRule, Rule } from 'postcss';
import type { RegistryItem } from 'shadcn/schema';
import { __unstable__loadDesignSystem } from 'tailwindcss';

import { registryInit } from '../src/registry/registry';
import { registryStyles } from '../src/registry/registry-styles';

export type CssDeclaration = {
  prop: string;
  scope: string[];
  value: string;
};

export function cssDeclarations(css: string) {
  const declarations: CssDeclaration[] = [];

  postcss.parse(css).walkDecls((declaration) => {
    const scope: string[] = [];

    for (
      let node: postcss.Node | undefined = declaration.parent;
      node;
      node = node.parent
    ) {
      if (node instanceof AtRule) {
        scope.unshift(`@${node.name} ${node.params}`.trim());
      }
      if (node instanceof Rule) scope.unshift(node.selector);
    }
    declarations.push({
      prop: declaration.prop,
      scope,
      value: declaration.value,
    });
  });

  return declarations;
}

export type VarRead = { fallback?: string; name: string; text: string };

export function varReads(value: string) {
  const reads: VarRead[] = [];

  for (const match of value.matchAll(/(?<![\w-])var\(/g)) {
    const open = match.index + match[0].length;
    let comma = -1;
    let depth = 1;
    let index = open;

    for (; index < value.length && depth > 0; index++) {
      if (value[index] === '(') depth += 1;
      if (value[index] === ')') depth -= 1;
      if (value[index] === ',' && depth === 1 && comma === -1) comma = index;
    }

    const close = depth === 0 ? index - 1 : value.length;

    reads.push({
      fallback: comma === -1 ? undefined : value.slice(comma + 1, close).trim(),
      name: value.slice(open, comma === -1 ? close : comma).trim(),
      text: value.slice(match.index, close + 1),
    });
  }

  return reads;
}

const colorTokensOf = (cssVars: RegistryItem['cssVars']) =>
  new Set([
    ...Object.keys(cssVars?.light ?? {}),
    ...Object.keys(cssVars?.dark ?? {}),
    ...Object.keys(cssVars?.theme ?? {})
      .filter((key) => key.startsWith('color-'))
      .map((key) => key.slice(6)),
  ]);

export const REGISTRY_COLOR_ITEMS = [...registryInit, ...registryStyles].filter(
  (item) =>
    (item.files?.length ?? 0) === 0 && colorTokensOf(item.cssVars).size > 0
);
const plateUiTheme = REGISTRY_COLOR_ITEMS.find(
  (item) => item.name === 'plate-ui'
)?.cssVars?.theme;
if (!plateUiTheme) throw new Error('Expected plate-ui to define cssVars.theme');
export const PLATE_UI_THEME = plateUiTheme;

const TOKEN_TO_ITEMS = new Map<string, string[]>();
const FALLBACK_TOKENS = new Map<
  string,
  { expected: string; fallback: string }
>();
const readTheme: Record<string, string> = { 'color-brand': 'var(--brand)' };

for (const item of REGISTRY_COLOR_ITEMS) {
  const { dark = {}, light = {}, theme = {} } = item.cssVars ?? {};
  for (const [key, value] of Object.entries(theme)) {
    readTheme[key] = value;
    const token = key.startsWith('color-') ? key.slice(6) : null;
    const [read, extra] = varReads(value);
    if (
      token &&
      !(token in light) &&
      !(token in dark) &&
      !extra &&
      read?.name === `--${token}` &&
      read.fallback !== undefined
    ) {
      FALLBACK_TOKENS.set(token, { expected: value, fallback: read.fallback });
    }
  }
  for (const token of colorTokensOf(item.cssVars)) {
    TOKEN_TO_ITEMS.set(token, [
      ...(TOKEN_TO_ITEMS.get(token) ?? []),
      item.name,
    ]);
    readTheme[`color-${token}`] ??= `var(--${token})`;
  }
}

const READ_THEME = `@theme inline { ${Object.entries(readTheme)
  .map(([key, value]) => `--${key}: ${value};`)
  .join(' ')} }`;
const COLOR_CANDIDATE_PATTERN = new RegExp(
  ['brand', ...TOKEN_TO_ITEMS.keys()].join('|')
);
const ARBITRARY_FALLBACK_PATTERN = new RegExp(
  String.raw`var\(--(?:color-)?(?:${['brand', ...FALLBACK_TOKENS.keys()].join('|')})\b`
);
const designSystems = new Map<
  string,
  ReturnType<typeof __unstable__loadDesignSystem>
>();

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function compileCandidates(theme: string, candidates: readonly string[]) {
  const unique = [...new Set(candidates.filter(Boolean))];
  if (unique.length === 0) return new Map<string, string[]>();
  const cached =
    designSystems.get(theme) ??
    __unstable__loadDesignSystem(`${theme}\n@tailwind utilities;`, {
      base: import.meta.dirname,
    });
  designSystems.set(theme, cached);
  const designSystem = await cached;

  return new Map(
    designSystem.candidatesToCss(unique).map((css, index) => [
      unique[index],
      css
        ? cssDeclarations(css)
            .filter(({ scope }) =>
              scope.some((selector) => selector.startsWith('.'))
            )
            .map(({ value }) => value)
        : [],
    ])
  );
}

type ReadHits = { items: Set<string>; themeTokens: Set<string> };

function assertEditorColorReads(
  label: string,
  values: Iterable<string>,
  hits: ReadHits,
  candidate?: string
) {
  for (const value of values) {
    for (const { fallback, name, text } of varReads(value)) {
      assert(
        name !== '--brand' && name !== '--color-brand',
        `Expected ${label} to read the editor color, not ${name}: ${text}`
      );
      const isColorVar = name.startsWith('--color-');
      const token = name.startsWith('--')
        ? name.slice(isColorVar ? 8 : 2)
        : null;
      if (!token) continue;
      const spec = FALLBACK_TOKENS.get(token);
      assert(
        !spec || (!isColorVar && fallback === spec.fallback),
        `Expected every read of the editor color in ${label} to be ${spec?.expected}: ${text}`
      );
      const owners = TOKEN_TO_ITEMS.get(token);
      if (!owners) continue;
      for (const owner of owners) hits.items.add(owner);
      if (isColorVar || (candidate && !candidate.includes(`--${token}`))) {
        hits.themeTokens.add(token);
      }
    }
  }
}

function assertCssColors(label: string, css: string, hits: ReadHits) {
  const declarations = cssDeclarations(css);
  const retired = declarations.find(
    ({ prop }) => prop === '--brand' || prop === '--color-brand'
  );

  assert(
    !retired,
    `Expected ${label} to declare no ${retired?.prop}, which Plate no longer reads`
  );
  assertEditorColorReads(
    label,
    declarations.map(({ value }) => value),
    hits
  );
}

export async function assertSourceColorReads(label: string, rawSource: string) {
  const hits: ReadHits = { items: new Set(), themeTokens: new Set() };
  let source = rawSource;
  if (!COLOR_CANDIDATE_PATTERN.test(source)) return hits;
  if (label.endsWith('.css')) {
    assertCssColors(label, source, hits);

    return hits;
  }
  if (label.endsWith('.mdx')) {
    const blocks: string[] = [];
    for (const [, marker, info, body] of source.matchAll(
      /^[ \t]*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm
    )) {
      if (marker.startsWith('`') && info.includes('`')) continue;
      if (info.trim().split(/\s+/)[0]?.toLowerCase() === 'css') {
        assertCssColors(label, body, hits);
      } else {
        blocks.push(body);
      }
    }
    source = blocks.join('\n');
    if (!COLOR_CANDIDATE_PATTERN.test(source)) return hits;
  }

  const literals: string[] = [];
  let end = 0;

  for (const read of varReads(source)) {
    const start = source.indexOf(read.text, end);
    const token = source
      .slice(0, start)
      .split(/[\s"'`]/)
      .at(-1);
    const inArbitraryValue = token?.includes('[');

    if (start < end || inArbitraryValue) continue;
    literals.push(read.text);
    end = start + read.text.length;
  }
  assertEditorColorReads(label, literals, hits);

  const candidates = source
    .split(/[\s"'`]+/)
    .filter((candidate) => COLOR_CANDIDATE_PATTERN.test(candidate));

  for (const [candidate, values] of await compileCandidates(
    READ_THEME,
    candidates
  )) {
    if (candidate.includes('[') && ARBITRARY_FALLBACK_PATTERN.test(candidate)) {
      assert(
        values.length > 0,
        `Expected ${label} to spell ${candidate} as a class Tailwind compiles`
      );
    }
    assertEditorColorReads(label, values, hits, candidate);
  }

  return hits;
}

export async function assertThemeEntries(
  label: string,
  css: string,
  requiredThemeTokens?: ReadonlySet<string>
) {
  const declarations = cssDeclarations(css);
  const themes = postcss
    .parse(css)
    .nodes.filter((node) => node.type === 'atrule' && node.name === 'theme')
    .map(String)
    .join('\n');

  const owned = {
    '.dark': new Map<string, string>(),
    ':root': new Map<string, string>(),
    '@theme inline': new Map<string, string>(),
  };

  for (const item of REGISTRY_COLOR_ITEMS) {
    const { dark = {}, light = {}, theme = {} } = item.cssVars ?? {};
    for (const [key, value] of Object.entries(light)) {
      owned[':root'].set(`--${key}`, value);
    }
    for (const [key, value] of Object.entries(dark)) {
      owned['.dark'].set(`--${key}`, value);
    }
    for (const [key, value] of Object.entries(theme)) {
      if (key.startsWith('color-')) {
        owned['@theme inline'].set(`--${key}`, value);
      }
    }
    const themeChecks = [
      ...Object.entries(theme).filter(([key]) => key.startsWith('color-')),
      ...[...new Set([...Object.keys(light), ...Object.keys(dark)])]
        .filter(
          (token) =>
            !(`color-${token}` in theme) &&
            (requiredThemeTokens?.has(token) ||
              declarations.some(
                ({ prop, scope }) =>
                  prop === `--color-${token}` && scope[0]?.startsWith('@theme')
              ))
        )
        .map((token) => [`color-${token}`, `var(--${token})`] as const),
    ];

    for (const [key, value] of themeChecks) {
      const utility = `bg-${key.slice(6)}`;
      const compiled = await compileCandidates(themes, [utility]);
      const values = compiled.get(utility) ?? [];
      assert(
        values.length === 1 && values[0] === value,
        `Expected the @theme blocks of ${label} to compile ${utility} to ${value}, not ${values.join(', ') || 'nothing'}`
      );
    }
    for (const [scope, entries] of [
      [':root', light],
      ['.dark', dark],
    ] as const) {
      for (const [key, value] of Object.entries(entries)) {
        const values = declarations
          .filter((d) => d.prop === `--${key}` && d.scope.join(' ') === scope)
          .map((d) => d.value);
        assert(
          values.length === 1 && values[0] === value,
          `Expected ${scope} in ${label} to declare --${key}: ${value} for ${item.name}, not ${values.join(', ') || 'nothing'}`
        );
      }
    }
  }

  const themeCounts = new Map<string, number>();

  for (const { prop, scope, value } of declarations) {
    const rule = scope.join(' ');
    if (prop.startsWith('--editor-')) {
      const expected =
        rule === ':root' || rule === '.dark'
          ? owned[rule].get(prop)
          : undefined;
      assert(
        expected === value,
        `Expected ${rule || 'root'} ${prop} in ${label} (${value}) to match a registry color item in :root or .dark, found ${expected ?? 'none'}`
      );
    }
    if (prop.startsWith('--color-editor-')) {
      const expected =
        rule === '@theme inline' ? owned['@theme inline'].get(prop) : undefined;
      assert(
        expected === value,
        `Expected ${rule || 'root'} ${prop} in ${label} (${value}) to match a registry color item in @theme inline, found ${expected ?? 'none'}`
      );
      themeCounts.set(prop, (themeCounts.get(prop) ?? 0) + 1);
    }
  }

  for (const prop of owned['@theme inline'].keys()) {
    if (!prop.startsWith('--color-editor-')) continue;
    const count = themeCounts.get(prop) ?? 0;
    assert(
      count === 1,
      `Expected ${prop} once in @theme inline of ${label}, found ${count}`
    );
  }
}
