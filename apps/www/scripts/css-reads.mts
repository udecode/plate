import postcss, { AtRule, Rule } from 'postcss';
import { compile } from 'tailwindcss';

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

export const PLATE_UI_THEME = {
  'color-editor-primary': 'var(--editor-primary, var(--primary))',
};

const EDITOR_PRIMARY = PLATE_UI_THEME['color-editor-primary'];
const RETIRED_BRAND_ENTRY = '--color-brand: var(--brand);';
const READ_THEME = `@theme inline { ${RETIRED_BRAND_ENTRY} ${Object.entries(
  PLATE_UI_THEME
)
  .map(([key, value]) => `--${key}: ${value};`)
  .join(' ')} }`;

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function utilityValues(theme: string, candidates: string[]) {
  const tailwind = await compile(`${theme}\n@tailwind utilities;`, {
    base: import.meta.dirname,
  });

  // A plain @theme block also emits its variables into a :root rule, so only
  // the declarations of class rules belong to the candidates.
  return cssDeclarations(tailwind.build(candidates))
    .filter(({ scope }) => scope.some((selector) => selector.startsWith('.')))
    .map(({ value }) => value);
}

export function assertEditorColorReads(
  label: string,
  values: Iterable<string>
) {
  for (const value of values) {
    for (const { fallback, name, text } of varReads(value)) {
      assert(
        name !== '--brand' && name !== '--color-brand',
        `Expected ${label} to read the editor color, not ${name}: ${text}`
      );
      assert(
        name !== '--color-editor-primary' &&
          (name !== '--editor-primary' || fallback === 'var(--primary)'),
        `Expected every read of the editor color in ${label} to be ${EDITOR_PRIMARY}: ${text}`
      );
    }
  }
}

export async function assertSourceColorReads(label: string, source: string) {
  if (label.endsWith('.css')) {
    assertEditorColorReads(
      label,
      cssDeclarations(source).map(({ value }) => value)
    );

    return;
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
  assertEditorColorReads(label, literals);

  const candidates = source.split(/[\s"'`]+/);

  assertEditorColorReads(label, await utilityValues(READ_THEME, candidates));
  for (const candidate of candidates) {
    if (
      candidate.includes('[') &&
      /var\(--(?:color-)?(?:brand|editor-primary)\b/.test(candidate)
    ) {
      const values = await utilityValues(READ_THEME, [candidate]);

      assert(
        values.length > 0,
        `Expected ${label} to spell ${candidate} as a class Tailwind compiles`
      );
    }
  }
}

export async function assertThemeEntries(label: string, css: string) {
  const themes = postcss
    .parse(css)
    .nodes.filter((node) => node.type === 'atrule' && node.name === 'theme')
    .map(String)
    .join('\n');

  for (const [key, value] of Object.entries(PLATE_UI_THEME)) {
    const utility = `bg-${key.slice('color-'.length)}`;
    const values = await utilityValues(themes, [utility]);

    assert(
      values.length === 1 && values[0] === value,
      `Expected the @theme blocks of ${label} to compile ${utility} to ${value}, not ${values.join(', ') || 'nothing'}`
    );
  }
}
