//   node tooling/scripts/mathml-tex-symbols.mjs            write the table
//   node tooling/scripts/mathml-tex-symbols.mjs --check    fail on the first entry that differs
//   add --report to either to print how many entries each family holds
//   node tooling/scripts/mathml-tex-symbols.mjs --fixture <KaTeX checkout>
//                                                          rewrite the supported-TeX fixture
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const TABLE = 'packages/platejs/src/math/lib/mathmlTexSymbols.internal.ts';
const FIXTURE =
  'packages/platejs/src/math/lib/__fixtures__/katex-supported-tex.json';

const require = createRequire(path.join(root, 'packages/platejs/package.json'));
const katex = require('katex');
const katexSource = (file) =>
  readFileSync(require.resolve(`katex/src/${file}`), 'utf-8');

const formatted = (file, content) => {
  const result = spawnSync(
    path.join(root, 'node_modules/.bin/oxfmt'),
    [`--stdin-filepath=${file}`],
    { cwd: root, encoding: 'utf-8', input: content }
  );
  if (result.status !== 0) {
    throw new Error(`oxfmt failed on ${file}: ${result.stderr}`);
  }
  return result.stdout;
};

const writeFixture = (checkout) => {
  const { version } = JSON.parse(
    readFileSync(path.join(checkout, 'package.json'), 'utf-8')
  );
  if (version !== katex.version) {
    throw new Error(
      `${checkout} holds KaTeX ${version}, but platejs pins ${katex.version}.`
    );
  }
  const commit = spawnSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  }).stdout.trim();
  const markdown = readFileSync(
    path.join(checkout, 'docs/supported.md'),
    'utf-8'
  );
  const samples = new Set();
  for (const match of markdown.matchAll(/\$\$([^$]+)\$\$|\$([^$`\n]+)\$/gu)) {
    const tex = (match[1] ?? match[2]).replaceAll('\\|', '|').trim();
    if (tex) samples.add(tex);
  }
  const fixture = {
    source: `KaTeX v${version} docs/supported.md, commit ${commit}`,
    license:
      'MIT License, Copyright (c) 2013-2020 Khan Academy and other contributors',
    extraction:
      'Each distinct $...$ or $$...$$ span in first-appearance order, trimmed, with \\| read as |.',
    samples: [...samples],
  };
  writeFileSync(
    path.join(root, FIXTURE),
    formatted(FIXTURE, JSON.stringify(fixture, null, 2))
  );
  console.log(`Wrote ${samples.size} samples to ${FIXTURE}.`);
};

const decodeLiteral = (body) =>
  body.replaceAll(/\\(u\{[\da-f]+\}|u[\da-f]{4}|.)/giu, (_, escape) =>
    escape.length > 1
      ? String.fromCodePoint(
          Number.parseInt(escape.replaceAll(/[u{}]/gu, ''), 16)
        )
      : escape
  );
const LITERAL = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`;
const literals = (text) =>
  [...text.matchAll(new RegExp(LITERAL, 'gu'))].map((match) =>
    decodeLiteral(match[0].slice(1, -1))
  );

const defineSymbolCall = new RegExp(
  String.raw`^defineSymbol\((math|text), (?:main|ams), \w+, (null|${LITERAL}|\w+), (${LITERAL}|\w+)(, true)?\);`,
  'u'
);

const readSymbols = () => {
  const strings = new Map();
  const symbols = [];
  let loop = null;
  for (const [index, line] of katexSource('symbols.js').split('\n').entries()) {
    const constant = /^(?:export )?const (\w+) = "([^"]*)";/u.exec(line);
    if (constant) strings.set(constant[1], decodeLiteral(constant[2]));
    const loopHead =
      /^for \(let i = 0; i < (\w+)(?:\.length)?; i\+\+\) \{/u.exec(line);
    if (loopHead) loop = strings.get(loopHead[1]) ?? null;
    if (line === '}') loop = null;
    if (!line.includes('defineSymbol(') || line.includes('function')) continue;
    const call = defineSymbolCall.exec(line.trim());
    if (!call) {
      throw new Error(
        `symbols.js:${index + 1} has a shape this script cannot read: ${line}`
      );
    }
    const [, mode, replace, name, accept] = call;
    if (name === 'ch' && replace === 'ch' && loop) {
      for (const ch of loop) {
        symbols.push({ accept: false, mode, name: ch, replace: ch });
      }
    } else if (/^["']/u.test(name)) {
      symbols.push({
        accept: Boolean(accept),
        mode,
        name: decodeLiteral(name.slice(1, -1)),
        replace: /^["']/u.test(replace)
          ? decodeLiteral(replace.slice(1, -1))
          : null,
      });
    } else if (name !== 'wideChar' && name !== 'ch') {
      throw new Error(
        `symbols.js:${index + 1} names a symbol this script cannot read: ${line}`
      );
    }
  }
  return symbols;
};

const ARRAY = String.raw`\[((?:\s|//[^\n]*|,|${LITERAL})*)\]`;
const NAMES_ARRAY = new RegExp(
  String.raw`define(Function|Environment)\(\{[^]*?names:\s*(?:${ARRAY}|(\w+))`,
  'gu'
);

const readFunctions = () => {
  const files = [
    ...[...katexSource('functions.js').matchAll(/import "\.\/(\w+\/\w+)";/gu)],
    ...[
      ...katexSource('environments.js').matchAll(/import "\.\/(\w+\/\w+)";/gu),
    ],
  ].map((match) => `${match[1]}.js`);
  const functions = [];
  const environments = [];
  for (const file of files) {
    const text = katexSource(file);
    const blocks = [...text.matchAll(NAMES_ARRAY)];
    if (blocks.length !== (text.match(/names:/gu) ?? []).length) {
      throw new Error(`${file} has a names list this script cannot read.`);
    }
    for (const [, kind, list, variable] of blocks) {
      const names =
        list ??
        new RegExp(String.raw`const ${variable} = ${ARRAY};`, 'u').exec(
          text
        )[1];
      for (const name of literals(names)) {
        (kind === 'Function' ? functions : environments).push({ file, name });
      }
    }
  }
  return { environments, functions };
};

const readMacros = () => {
  const text = katexSource('macros.js');
  const names = [
    ...text.matchAll(/^defineMacro\(\s*"((?:[^"\\]|\\.)*)"/gmu),
  ].map((match) => decodeLiteral(match[1]));
  if (names.length !== (text.match(/^defineMacro\(/gmu) ?? []).length) {
    throw new Error(
      'macros.js has a defineMacro call this script cannot read.'
    );
  }
  return names;
};

const readDelimiters = () =>
  literals(
    /const delimiters = \[([^]*?)\];/u.exec(
      katexSource('functions/delimsizing.js')
    )[1]
  );

const isPublic = (name) =>
  !name.includes('@') &&
  /^(?:\\(?:[A-Za-z]+|[ -~])|[!-[\]-~]|--|---|``|'')$/u.test(name);

const ENTITIES = { amp: '&', gt: '>', lt: '<', quot: '"', '#x27': "'" };
const decodeEntities = (text) =>
  text.replaceAll(/&(amp|gt|lt|quot|#x27);/gu, (_, name) => ENTITIES[name]);

const parseMarkup = (markup) => {
  const top = { children: [] };
  const stack = [top];
  for (const [, close, tag, attributes, selfClose, text] of markup.matchAll(
    /<(\/?)([a-z-]+)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/gu
  )) {
    const parent = stack.at(-1);
    if (text !== undefined) {
      parent.children.push(decodeEntities(text));
    } else if (close) {
      stack.pop();
    } else {
      const node = {
        attributes: [...attributes.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/gu)]
          .map((match) => [match[1], decodeEntities(match[2])])
          .toSorted(([a], [b]) => (a < b ? -1 : 1)),
        children: [],
        tag,
      };
      parent.children.push(node);
      if (!selfClose) stack.push(node);
    }
  }
  return top.children;
};

const signature = (node) =>
  [
    node.tag,
    ...node.attributes.map(([name, value]) => `${name}="${value}"`),
  ].join(' ');
const serialize = (nodes) =>
  nodes
    .map((node) =>
      typeof node === 'string'
        ? JSON.stringify(node)
        : `<${signature(node)}>${serialize(node.children)}</${node.tag}>`
    )
    .join('');
const textOf = (node) => node.children.join('');
const textContent = (node) =>
  typeof node === 'string' ? node : node.children.map(textContent).join('');
const isLeaf = (node) =>
  typeof node !== 'string' &&
  node.children.every((child) => typeof child === 'string');

const quiet = (render) => {
  // \show, \message and \errmessage print through the console.
  const { error, log, warn } = console;
  console.error = () => {};
  console.log = () => {};
  console.warn = () => {};
  try {
    return render();
  } catch {
    return null;
  } finally {
    Object.assign(console, { error, log, warn });
  }
};

const render = (tex, displayMode = false) =>
  quiet(() => {
    const [span] = parseMarkup(
      katex.renderToString(tex, {
        displayMode,
        output: 'mathml',
        strict: 'ignore',
        throwOnError: true,
      })
    );
    const [semantics] = span.children[0].children;
    const [body] = semantics.children;
    return body.tag === 'mrow' ? body.children : [body];
  });
const FONT_SHORTHAND =
  /^(?:(?:normal|italic|oblique|small-caps|bold|bolder|lighter|\d{3})\s+)*([\d.]+\w*)(?:\/\S+)?\s+(.+)$/u;
const firstFamily = (value) =>
  value
    .split(',')[0]
    .trim()
    .replaceAll(/^["']|["']$/gu, '');

const readInertClasses = () => {
  const css = readFileSync(
    require.resolve('katex/dist/katex.css'),
    'utf-8'
  ).replaceAll(/\/\*[^]*?\*\//gu, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)]
    .map(([, selectors, body]) => ({
      declarations: body
        .split(';')
        .map((declaration) => declaration.split(':').map((part) => part.trim()))
        .filter(([property, value]) => property && value),
      selectors: selectors.split(',').map((selector) => selector.trim()),
    }))
    .filter(({ selectors }) => !selectors[0].startsWith('@'));
  const base = new Map();
  for (const { declarations, selectors } of rules) {
    if (!selectors.includes('.katex')) continue;
    for (const [property, value] of declarations) {
      const font = property === 'font' && FONT_SHORTHAND.exec(value);
      if (font) {
        base.set('font-family', firstFamily(font[2]));
        for (const longhand of ['font-style', 'font-variant', 'font-weight']) {
          base.set(longhand, 'normal');
        }
      } else {
        base.set(property, value);
      }
    }
  }
  const repeatsBase = (declarations) =>
    declarations.every(([property, value]) =>
      property === 'font-family'
        ? base.get(property) === firstFamily(value)
        : base.get(property) === value
    );
  const drawing = new Set();
  for (const { declarations, selectors } of rules) {
    for (const selector of selectors) {
      const own = /^\.katex \.([\w-]+)$/u.exec(selector)?.[1];
      for (const [, name] of selector.matchAll(/\.([\w-]+)/gu)) {
        if (name !== own || !repeatsBase(declarations)) drawing.add(name);
      }
    }
  }
  return (name) => !drawing.has(name);
};
let isInertClass;
const drawnClasses = (html) => {
  isInertClass ??= readInertClasses();
  return html.replaceAll(/ class="([^"]*)"/gu, (_, classes) => {
    const kept = classes.split(' ').filter((name) => !isInertClass(name));
    return kept.length === 0 ? '' : ` class="${kept.join(' ')}"`;
  });
};

const renderHtml = (tex, displayMode) =>
  quiet(() =>
    drawnClasses(
      katex.renderToString(tex, {
        displayMode,
        output: 'html',
        strict: 'ignore',
        throwOnError: true,
      })
    )
  );

const TOKEN_TAGS = new Set(['mi', 'mn', 'mo', 'ms', 'mtext']);
const SPACE_TEXT = /^[\s​-‏⁠-⁤﻿]*$/u;
const isInvisibleOperator = (node) =>
  node.tag === 'mo' && isLeaf(node) && /^[⁡-⁤]$/u.test(textOf(node));
const isSpace = (node) =>
  isLeaf(node) &&
  (node.tag === 'mspace' ||
    (node.tag === 'mtext' && SPACE_TEXT.test(textOf(node))));
const isToken = (node) =>
  isLeaf(node) &&
  TOKEN_TAGS.has(node.tag) &&
  textOf(node) !== '' &&
  !isSpace(node);

const chainTo = (nodes, contents) => {
  if (contents.includes(serialize(nodes))) return [];
  if (nodes.length !== 1 || typeof nodes[0] === 'string') return null;
  const rest = chainTo(nodes[0].children, contents);
  return rest && [signature(nodes[0]), ...rest];
};

/**
 * KaTeX groups an argument of several nodes in a bare `mrow` and writes one
 * node alone, so that `mrow` belongs to the argument, not to the wrapper.
 */
const wrapperChain = (nodes, contents) => {
  const chain = chainTo(nodes, contents);
  return chain?.at(-1) === 'mrow' ? chain.slice(0, -1) : chain;
};

// Every argument template ends with a letter and a digit, so a switch such as
// `\bf`, which also restyles what follows, never reads as a one-argument command.
const TAIL = 'z1';
let tail;
const withoutTail = (nodes) => {
  tail ??= render(TAIL);
  return nodes && serialize(nodes.slice(-tail.length)) === serialize(tail)
    ? nodes.slice(0, -tail.length)
    : null;
};

const shortestRepeatingUnit = (value) => {
  const items = value.split(' ');
  const size = items.findIndex(
    (_, length) =>
      length > 0 && items.every((item, index) => item === items[index % length])
  );
  return size === -1 ? value : items.slice(0, size).join(' ');
};

const FAMILY_NOTES = {
  accents:
    'Accent marks by `<outer>><mark>` signature, then by the mark text; the base is the outer element first child.',
  classes:
    'Wrappers whose outer element is `mo`, by signature chain; the argument is what the innermost one holds.',
  delimiterSizes:
    '`mo` signatures that `\\big`, `\\left` and their kin write around a delimiter.',
  delimiters:
    'Delimiter names by the `mo` text a sized or middle delimiter writes.',
  enclosures: 'Wrappers whose outer element is `menclose`, by signature chain.',
  environments: 'Environments by name.',
  fonts:
    'Font commands by the signature of the token they write, read with the token text as the argument.',
  padding:
    'Wrappers whose outer element is `mpadded` or `mphantom`, by signature chain.',
  sizes:
    'Switches such as `\\large` or `\\displaystyle` by the `mstyle` chain they open.',
  spaces: 'Spaces by signature, then by text, empty for `mspace`.',
  tokens:
    'Tokens by signature, then by text. KaTeX writes an invisible operator after some, such as `\\sin`, which the table leaves out.',
};

const buildTable = () => {
  const fixture = JSON.parse(readFileSync(path.join(root, FIXTURE), 'utf-8'));
  const used = new Set();
  for (const tex of fixture.samples) {
    for (const [token] of tex.matchAll(/\\[A-Za-z]+\*?|\\[^A-Za-z]|[^\\]/gu)) {
      used.add(token);
    }
    for (const [, name] of tex.matchAll(/\\begin\{([^}]*)\}/gu)) used.add(name);
  }

  const order = new Map();
  const accepted = { math: new Set(), text: new Set() };
  const mathSymbols = new Set();
  const define = (name) => {
    if (!order.has(name)) order.set(name, order.size);
  };
  for (const symbol of readSymbols()) {
    define(symbol.name);
    if (symbol.accept) accepted[symbol.mode].add(symbol.name);
    if (symbol.mode === 'math') mathSymbols.add(symbol.name);
    // acceptUnicodeChar also makes the character a name, such as `(` for `\lparen`.
    if (symbol.accept && /^[!-~]$/u.test(symbol.replace)) {
      define(symbol.replace);
      if (symbol.mode === 'math') mathSymbols.add(symbol.replace);
    }
  }
  const { environments, functions } = readFunctions();
  for (const { name } of functions) define(name);
  for (const name of readMacros()) define(name);
  const environmentOrder = new Map(
    environments.map(({ name }, index) => [name, order.size + index])
  );
  const delimiterNames = new Set(readDelimiters().filter(isPublic));
  const delimiterSizing = new Set(
    functions
      .filter(({ file }) => file === 'functions/delimsizing.js')
      .map(({ name }) => name)
  );

  const slots = new Map();
  const add = (family, mode, key, sub, name, tex, displayMode = false) => {
    const slotKey = JSON.stringify([family, mode, key, sub]);
    const slot = slots.get(slotKey) ?? {
      candidates: [],
      family,
      key,
      mode,
      sub,
    };
    slot.candidates.push({ displayMode, name, tex });
    slots.set(slotKey, slot);
  };
  const failed = [];
  const unclassified = [];

  const mathX = serialize(render('x'));
  const xyContents = [serialize(render('xy')), serialize(render('{xy}'))];
  const xyText = JSON.stringify('xy');

  const FONT_TAGS = new Set(['mi', 'mn', 'mtext']);
  const addFont = (name, argument) => {
    const nodes = withoutTail(render(`${name}{${argument}}${TAIL}`));
    const [node] = nodes ?? [];
    if (
      nodes?.length !== 1 ||
      !isToken(node) ||
      !FONT_TAGS.has(node.tag) ||
      textOf(node) !== argument ||
      serialize(nodes) === serialize(render(argument))
    ) {
      return false;
    }
    add('fonts', 'math', signature(node), '', name, `${name}{${argument}}`);
    return true;
  };

  const classifyMath = (name) => {
    const alone = render(name);
    const token =
      alone?.length === 2 && isInvisibleOperator(alone[1]) ? [alone[0]] : alone;
    if (token?.length === 1 && isToken(token[0])) {
      add('tokens', 'math', signature(token[0]), textOf(token[0]), name, name);
      return 'classified';
    }
    if (alone?.length === 1 && isSpace(alone[0])) {
      add('spaces', 'math', signature(alone[0]), textOf(alone[0]), name, name);
      return 'classified';
    }
    // KaTeX's script fonts draw only capitals, so a lower-case letter would
    // hide that \mathcal and \mathscr draw differently.
    const onLetter = addFont(name, 'A');
    if (addFont(name, '1') || onLetter) return 'classified';
    const onX = withoutTail(render(`${name}{x}${TAIL}`));
    const [node] = onX ?? [];
    if (onX?.length === 1 && node.children?.length === 2) {
      const [base, mark] = node.children;
      if (serialize([base]) === mathX && isToken(mark)) {
        add(
          'accents',
          'math',
          `${signature(node)}>${signature(mark)}`,
          textOf(mark),
          name,
          `${name}{x}`
        );
        return 'classified';
      }
    }
    const onXy = withoutTail(render(`${name}{xy}${TAIL}`));
    const chain = onXy && wrapperChain(onXy, [...xyContents, xyText]);
    const outer = chain?.[0]?.split(' ')[0];
    const wrapper = {
      menclose: 'enclosures',
      mo: 'classes',
      mpadded: 'padding',
      mphantom: 'padding',
    }[outer];
    if (wrapper) {
      add(wrapper, 'math', chain.join('>'), '', name, `${name}{xy}`);
      return 'classified';
    }
    const switched = withoutTail(render(`{${name} xy}${TAIL}`));
    const switchChain = switched && wrapperChain(switched, xyContents);
    if (
      switchChain?.length &&
      switchChain.every((link) => link.startsWith('mstyle '))
    ) {
      add('sizes', 'math', switchChain.join('>'), '', name, `{${name} xy}`);
      return 'classified';
    }
    return [alone, onX, onXy, switched].some(Boolean) ? 'rendered' : 'failed';
  };

  const textX = JSON.stringify('x');
  const classifyText = (name) => {
    const alone = render(`\\text{${name}}`);
    if (alone?.length === 1 && isToken(alone[0])) {
      add(
        'tokens',
        'text',
        signature(alone[0]),
        textOf(alone[0]),
        name,
        `\\text{${name}}`
      );
      return true;
    }
    if (alone?.length === 1 && isSpace(alone[0])) {
      add(
        'spaces',
        'text',
        signature(alone[0]),
        textOf(alone[0]),
        name,
        `\\text{${name}}`
      );
      return true;
    }
    const onX = render(`\\text{${name}{x}}`);
    const [node] = onX ?? [];
    if (onX?.length === 1 && node.children?.length === 2) {
      const [base, mark] = node.children;
      if (
        base.tag === 'mtext' &&
        serialize(base.children) === textX &&
        isToken(mark)
      ) {
        add(
          'accents',
          'text',
          `${signature(node)}>${signature(mark)}`,
          textOf(mark),
          name,
          `\\text{${name}{x}}`
        );
        return true;
      }
    }
    return false;
  };

  const classifyDelimiterSizing = (name) => {
    const templates = {
      '\\left': ['\\left( x \\right.', 0, '('],
      '\\middle': ['\\left. x \\middle( x \\right.', 1, '('],
      '\\right': ['\\left. x \\right)', -1, ')'],
    };
    const [tex, at, delimiter] = templates[name] ?? [`${name}(`, 0, '('];
    const node = render(tex)?.at(at);
    if (!node || !isToken(node) || textOf(node) !== delimiter) return 'failed';
    add('delimiterSizes', 'math', signature(node), '', name, tex);
    return 'classified';
  };

  const fence = (node) => {
    if (node === undefined) return '';
    return isLeaf(node) && node.tag === 'mo' ? textOf(node) : null;
  };
  const readEnvironment = (nodes, kind, displayMode) => {
    const index = nodes.findIndex((node) => textContent(node).includes('a'));
    if (index === -1 || index > 1 || nodes.length - index > 2) return null;
    const open = fence(nodes[index - 1]);
    const close = fence(nodes[index + 1]);
    let table = nodes[index];
    const outer = [];
    while (table.tag !== 'mtable' && table.children.length === 1) {
      outer.push(signature(table));
      [table] = table.children;
    }
    if (table.tag !== 'mtable' || open === null || close === null) return null;
    const cells = table.children[0].children;
    const content = cells.findIndex((cell) => textContent(cell) === 'a');
    if (content === -1) return null;
    const contentChain = chainTo([cells[content]], [serialize(render('a'))]);
    return {
      argument: kind,
      cell: contentChain?.join('>') ?? signature(cells[content]),
      close,
      display: displayMode,
      glue: [
        cells.slice(0, content).map(signature),
        cells
          .slice(cells.findLastIndex((cell) => cell.children.length > 0) + 1)
          .map(signature),
      ],
      leads:
        textContent(cells[content + 1] ?? '') === 'b' &&
        serialize([cells[content + 1]]).includes('<mrow></mrow>'),
      open,
      table: [
        ...outer,
        signature({
          ...table,
          attributes: table.attributes.map(([attribute, value]) => [
            attribute,
            attribute.startsWith('column')
              ? shortestRepeatingUnit(value)
              : value,
          ]),
        }),
      ].join('>'),
    };
  };
  const ENVIRONMENT_TEMPLATES = [
    ['', '', 'a&b&c&d\\\\e&f&g&h'],
    ['{cccc}', 'columns', 'a&b&c&d\\\\e&f&g&h'],
    ['{2}', 'pairs', 'a&b&c&d\\\\e&f&g&h'],
    // `split` takes at most two columns, and its column attributes alternate.
    ['', '', 'a&b\\\\e&f'],
    ['{c}', 'columns', 'a\\\\e'],
    ['', '', 'a\\\\e'],
    ['', '', 'a'],
  ];
  const classifyEnvironment = (name) => {
    for (const displayMode of [false, true]) {
      for (const [argument, kind, body] of ENVIRONMENT_TEMPLATES) {
        const tex = `\\begin{${name}}${argument}${body}\\end{${name}}`;
        const nodes = render(tex, displayMode);
        const environment = nodes && readEnvironment(nodes, kind, displayMode);
        if (!environment) continue;
        add(
          'environments',
          'math',
          JSON.stringify(environment),
          '',
          name,
          tex,
          displayMode
        );
        return true;
      }
    }
    return false;
  };

  const arrowLabels = new Set();
  const classifyArrow = (name) => {
    const [node] = render(`${name}{x}`) ?? [];
    const [arrow, label] = node?.children ?? [];
    if (node?.tag !== 'mover' || !isToken(arrow) || label?.tag !== 'mpadded') {
      return false;
    }
    arrowLabels.add(signature(label));
    add('arrows', 'math', signature(arrow), textOf(arrow), name, `${name}{x}`);
    return true;
  };
  const arrowNames = new Set(
    functions
      .filter(({ file }) => file === 'functions/arrow.js')
      .map(({ name }) => name)
  );

  for (const name of [...order.keys()].filter(isPublic)) {
    if (arrowNames.has(name) && classifyArrow(name)) continue;
    const math = delimiterSizing.has(name)
      ? classifyDelimiterSizing(name)
      : classifyMath(name);
    const text = !delimiterSizing.has(name) && classifyText(name);
    if (math === 'failed' && !text) failed.push(name);
    if (math === 'rendered' && !text) unclassified.push(name);
  }
  // KaTeX writes a kern of one mu as a hair space, which no name writes.
  for (const kern of ['\\mkern1mu', '\\mkern-1mu']) classifyMath(kern);
  if (arrowLabels.size !== 1) {
    throw new Error(
      `KaTeX wraps arrow labels in ${arrowLabels.size} ways; the table keeps one.`
    );
  }
  for (const name of delimiterNames) {
    const node = render(`\\big${name}`)?.[0];
    if (!node || !isToken(node)) continue;
    add('delimiters', 'math', textOf(node), '', name, `\\big${name}`);
    // `\middle|` writes `|` where `\big|` writes U+2223.
    const [middle] = render(`\\left.\\middle${name}\\right.`) ?? [];
    if (middle && isToken(middle) && textOf(middle) !== textOf(node)) {
      add('delimiters', 'math', textOf(middle), '', name, `\\middle${name}`);
    }
  }
  for (const { name } of environments) {
    if (!classifyEnvironment(name)) failed.push(`{${name}}`);
  }

  const orderOf = (name) => order.get(name) ?? environmentOrder.get(name);
  const preference = (slot) => {
    const text = slot.family === 'delimiters' ? slot.key : slot.sub;
    const ranks = (name) => [
      used.has(name),
      name === text,
      accepted[slot.mode].has(name),
    ];
    return (a, b) => {
      const [left, right] = [ranks(a.name), ranks(b.name)];
      const better = left.findIndex((rank, index) => rank !== right[index]);
      return better === -1
        ? orderOf(a.name) - orderOf(b.name)
        : Number(right[better]) - Number(left[better]);
    };
  };

  const families = {};
  const ambiguous = [];
  const symbols = new Map();
  for (const slot of slots.values()) {
    const candidates = [
      ...new Map(
        slot.candidates.map((candidate) => [candidate.name, candidate])
      ).values(),
    ].toSorted(preference(slot));
    const [chosen] = candidates;
    const drawing = (candidate) =>
      renderHtml(candidate.tex, candidate.displayMode);
    const others = candidates
      .filter((candidate) => drawing(candidate) !== drawing(chosen))
      .map((candidate) => candidate.name);
    const pick = others.length > 0 ? [chosen.name, ...others] : chosen.name;
    if (
      slot.family === 'tokens' &&
      slot.mode === 'math' &&
      candidates.some((candidate) => mathSymbols.has(candidate.name))
    ) {
      symbols.set(slot.key, [...(symbols.get(slot.key) ?? []), slot.sub]);
    }
    if (others.length > 0) ambiguous.push(pick);
    families[slot.family] ??= { math: new Map(), text: new Map() };
    const entries = families[slot.family][slot.mode];
    if (slot.family === 'environments') {
      entries.set(chosen.name, { ...JSON.parse(slot.key), others });
    } else if (BY_TEXT.has(slot.family) || slot.family === 'arrows') {
      const inner = entries.get(slot.key) ?? new Map();
      inner.set(slot.sub, pick);
      entries.set(slot.key, inner);
    } else {
      entries.set(slot.key, pick);
    }
  }
  const asciiItself = [];
  for (let code = 0x21; code <= 0x7e; code++) {
    const ch = String.fromCodePoint(code);
    const nodes = render(ch);
    if (
      nodes?.length === 1 &&
      ['mi', 'mn', 'mo'].includes(nodes[0].tag) &&
      isLeaf(nodes[0])
    ) {
      asciiItself.push(ch);
    }
  }

  // `\limits` refuses a name that is not an operator.
  const operators = new Map();
  for (const inner of families.tokens.math.values()) {
    for (const item of inner.values()) {
      const name = typeof item === 'string' ? item : item[0];
      if (operators.has(name) || !render(`${name}\\limits_{x}`, true)) {
        continue;
      }
      operators.set(name, render(`${name}_{x}`, true)[0].tag === 'munder');
    }
  }

  const styleScales = new Map();
  for (const [key, item] of families.sizes.math) {
    if (!key.includes('scriptlevel=')) continue;
    for (const name of typeof item === 'string' ? [item] : item) {
      const [style] = render(`${name}\\hspace{10000em}`);
      const width = style.children[0].attributes.find(
        ([attribute]) => attribute === 'width'
      )[1];
      styleScales.set(
        name,
        Number((Number.parseFloat(width) / 10_000).toFixed(8))
      );
    }
  }

  return {
    ambiguous,
    arrowLabel: [...arrowLabels][0],
    asciiItself,
    failed,
    families,
    operators,
    styleScales,
    symbols,
    unclassified,
  };
};

const PRINTABLE = /^[\p{L}\p{N}\p{P}\p{S}]$/u;
const quote = (text) =>
  `'${[...text]
    .map((ch) => {
      if (ch === "'" || ch === '\\') return `\\${ch}`;
      if (ch === ' ' || PRINTABLE.test(ch)) return ch;
      const code = ch.codePointAt(0).toString(16).toUpperCase();
      return code.length > 4 ? `\\u{${code}}` : `\\u${code.padStart(4, '0')}`;
    })
    .join('')}'`;

const TABLE_HELPER = 'withoutPrototype';
const object = (body) => `${TABLE_HELPER}({\n${body}\n})`;
const sorted = (map) =>
  [...map].toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const record = (map, value) =>
  object(
    sorted(map)
      .map(([key, item]) => `${quote(key)}: ${value(item)},`)
      .join('\n')
  );
const list = (items) => `[${items.map(quote).join(', ')}]`;
const pick = (item) => (typeof item === 'string' ? quote(item) : list(item));
const byText = (map) => record(map, (inner) => record(inner, pick));
const environment = (entry) =>
  object(
    `argument: ${quote(entry.argument)}, cell: ${quote(entry.cell)}, close: ${quote(entry.close)}, display: ${entry.display}, glue: [${list(entry.glue[0])}, ${list(entry.glue[1])}], leads: ${entry.leads}, open: ${quote(entry.open)}, others: ${list(entry.others)}, table: ${quote(entry.table)}`
  );

const EXPORTS = [
  ['tokens', 'MATHML_TEX_TOKENS', 'MathmlTexModes<MathmlTexByText>'],
  ['spaces', 'MATHML_TEX_SPACES', 'MathmlTexModes<MathmlTexByText>'],
  ['accents', 'MATHML_TEX_ACCENTS', 'MathmlTexModes<MathmlTexByText>'],
  ['fonts', 'MATHML_TEX_FONTS', 'MathmlTexBySignature'],
  ['sizes', 'MATHML_TEX_SIZES', 'MathmlTexBySignature'],
  ['classes', 'MATHML_TEX_CLASSES', 'MathmlTexBySignature'],
  ['enclosures', 'MATHML_TEX_ENCLOSURES', 'MathmlTexBySignature'],
  ['padding', 'MATHML_TEX_PADDING', 'MathmlTexBySignature'],
  ['delimiterSizes', 'MATHML_TEX_DELIMITER_SIZES', 'MathmlTexBySignature'],
  [
    'delimiters',
    'MATHML_TEX_DELIMITERS',
    'Readonly<Record<string, MathmlTexPick>>',
  ],
  [
    'environments',
    'MATHML_TEX_ENVIRONMENTS',
    'Readonly<Record<MathmlTexName, MathmlTexEnvironment>>',
  ],
];
const BY_TEXT = new Set(['accents', 'spaces', 'tokens']);

const tableNames = (families) =>
  Object.entries(families).flatMap(([family, modes]) =>
    [modes.math, modes.text].flatMap((entries) =>
      [...entries].flatMap(([key, item]) => {
        if (family === 'environments') return [key, ...item.others];
        return (item instanceof Map ? [...item.values()] : [item]).flat();
      })
    )
  );

const writeTable = ({
  arrowLabel,
  asciiItself,
  families,
  operators,
  styleScales,
  symbols,
}) => {
  const bad = tableNames(families).find((name) => name.includes('@'));
  if (bad) {
    throw new Error(`The table would write ${bad}, which KaTeX keeps private.`);
  }
  const hash = createHash('sha256')
    .update(readFileSync(fileURLToPath(import.meta.url)))
    .digest('hex')
    .slice(0, 16);
  const of = (family, mode) => families[family]?.[mode] ?? new Map();
  const value = (family) => {
    if (BY_TEXT.has(family)) {
      return object(
        `math: ${byText(of(family, 'math'))},\ntext: ${byText(of(family, 'text'))},`
      );
    }
    return record(
      of(family, 'math'),
      family === 'environments' ? environment : pick
    );
  };
  const constants = EXPORTS.map(
    ([family, name, type]) =>
      `/** ${FAMILY_NOTES[family]} */\nexport const ${name}: ${type} = ${value(family)};`
  ).join('\n\n');
  const symbolTexts = record(symbols, list);
  const limits = record(operators, String);
  return `// Generated by tooling/scripts/mathml-tex-symbols.mjs from KaTeX ${katex.version}. Run it to update this file.
// Generator sha256: ${hash}

/**
 * An element as KaTeX writes it: its tag, then each attribute as \`name="value"\`
 * in name order, joined by spaces, such as \`mo stretchy="false"\`. A chain joins
 * nested elements with \`>\`, outermost first. Values listed per column, such as
 * \`columnalign\`, are cut to their shortest repeating unit.
 */
export type MathmlSignature = string;

/** TeX that KaTeX reads, such as \`\\sum\` or \`(\`. Never holds \`@\`. */
export type MathmlTexName = string;

/**
 * The name an entry writes. When other names write the same MathML but KaTeX
 * draws them differently, such as \`\\mathcal\` and \`\\mathscr\`, it lists the
 * name the table picks first and then those other names.
 */
export type MathmlTexPick =
  | MathmlTexName
  | readonly [pick: MathmlTexName, ...others: MathmlTexName[]];

export type MathmlTexByText = Readonly<
  Record<MathmlSignature, Readonly<Record<string, MathmlTexPick>>>
>;

export type MathmlTexBySignature = Readonly<Record<MathmlSignature, MathmlTexPick>>;

/** Entries for math mode, and for text mode inside \`\\text\`. */
export type MathmlTexModes<T> = { readonly math: T; readonly text: T };

export type MathmlTexEnvironment = {
  /** \`columns\` for a column spec such as \`{cc}\`, \`pairs\` for a column-pair count. */
  readonly argument: '' | 'columns' | 'pairs';
  /** The chain from a content \`mtd\` down to the cell's content. */
  readonly cell: MathmlSignature;
  /** The fence text after the table, empty when none. */
  readonly close: string;
  /** Whether KaTeX renders it only in display mode. */
  readonly display: boolean;
  /** Signatures of the empty cells KaTeX writes before and after each row's content. */
  readonly glue: readonly [
    before: readonly MathmlSignature[],
    after: readonly MathmlSignature[],
  ];
  /**
   * Whether KaTeX starts each even column's content with an empty group, as
   * \`align\` does, which TeX for that column leaves out.
   */
  readonly leads: boolean;
  /** The fence text before the table, empty when none. */
  readonly open: string;
  /** Environments that write the same MathML but that KaTeX draws differently. */
  readonly others: readonly MathmlTexName[];
  /** The chain from the outermost element down to the \`mtable\`. */
  readonly table: MathmlSignature;
};

export const ${TABLE_HELPER} = <T extends object>(entries: T): T =>
  Object.assign(Object.create(null) as object, entries);

export const MATHML_TEX_KATEX_VERSION = ${quote(katex.version)};

${constants}

/**
 * The math tokens that \`katex/src/symbols.js\` defines, as the signature and
 * text of their \`MATHML_TEX_TOKENS.math\` entries. A token with no exact entry
 * falls back to one of these with the same text.
 */
export const MATHML_TEX_SYMBOLS: Readonly<Record<MathmlSignature, readonly string[]>> = ${symbolTexts};

/**
 * The printable ASCII characters that KaTeX renders alone in math mode as one
 * \`mi\`, \`mo\` or \`mn\`, so the character itself is TeX for that token.
 */
export const MATHML_TEX_ASCII_ITSELF = ${quote(asciiItself.join(''))};

/**
 * The names that take \`\\limits\`, each with whether KaTeX sets its scripts
 * under and over it in display style.
 */
export const MATHML_TEX_OPERATORS: Readonly<Record<MathmlTexName, boolean>> = ${limits};

/** Arrows such as \`\\xrightarrow\` by the signature and text of the arrow they draw. */
export const MATHML_TEX_ARROWS: MathmlTexByText = ${byText(of('arrows', 'math'))};

export const MATHML_TEX_ARROW_LABEL_SIGNATURE = ${quote(arrowLabel)};

export const MATHML_TEX_STYLE_EM_SCALES: Readonly<Record<MathmlTexName, number>> = ${record(styleScales, String)};
`;
};

const entryPath = (lines, at) => {
  const indent = (line) => /^ */u.exec(line)[0].length;
  const keys = [lines[at].trim()];
  let depth = indent(lines[at]);
  for (let index = at - 1; index >= 0 && depth > 0; index--) {
    if (lines[index].trim() !== '' && indent(lines[index]) < depth) {
      depth = indent(lines[index]);
      keys.unshift(lines[index].trim().replace(/\s*[{[]$/u, ''));
    }
  }
  return keys.join(' > ');
};

const report = (built) => {
  const counts = {};
  for (const [family, modes] of Object.entries(built.families)) {
    for (const mode of ['math', 'text']) {
      const entries = [...modes[mode].values()];
      const size = entries.reduce(
        (sum, item) => sum + (item instanceof Map ? item.size : 1),
        0
      );
      if (size > 0) counts[`${family}.${mode}`] = size;
    }
  }
  counts.asciiItself = built.asciiItself.length;
  counts.symbols = [...built.symbols.values()].flat().length;
  return {
    ambiguous: built.ambiguous,
    asciiNotItself: Array.from({ length: 94 }, (_, index) =>
      String.fromCodePoint(0x21 + index)
    ).filter((ch) => !built.asciiItself.includes(ch)),
    counts,
    failed: built.failed,
    namesWithAt: tableNames(built.families).filter((name) =>
      name.includes('@')
    ),
    unclassified: built.unclassified,
  };
};

const args = process.argv.slice(2);
if (args[0] === '--fixture') {
  writeFixture(path.resolve(args[1]));
} else {
  const built = buildTable();
  const content = formatted(TABLE, writeTable(built));
  if (args.includes('--check')) {
    const current = readFileSync(path.join(root, TABLE), 'utf-8').split('\n');
    const expected = content.split('\n');
    let at = expected.findIndex((text, index) => text !== current[index]);
    if (at === -1 && current.length !== expected.length) at = expected.length;
    if (at !== -1) {
      const where =
        at < expected.length ? entryPath(expected, at) : '(end of file)';
      console.error(
        `${TABLE}:${at + 1} differs from what KaTeX ${katex.version} renders, at ${where}\n  expected: ${expected[at] ?? '(end of file)'}\n  found:    ${current[at] ?? '(end of file)'}\nRun node tooling/scripts/mathml-tex-symbols.mjs to update it.`
      );
      process.exit(1);
    }
    console.log(`${TABLE} matches KaTeX ${katex.version}.`);
  } else {
    writeFileSync(path.join(root, TABLE), content);
    console.log(`Wrote ${TABLE}.`);
  }
  if (args.includes('--report')) {
    console.log(JSON.stringify(report(built), null, 1));
  }
}
