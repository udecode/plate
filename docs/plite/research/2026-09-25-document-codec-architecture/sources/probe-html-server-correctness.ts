import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import {
  DOMParser,
} from '../../../../../../linkedom/esm/index.js';

import {
  BaseParagraphPlugin,
  definePlugin,
  property,
  schema,
} from '../../../../../packages/platejs/src/core';
import { parseHtml as parsePlateHtml } from '../../../../../packages/platejs/src/html/server';

const root = fileURLToPath(new URL('../../../../..', import.meta.url));
const require = createRequire(import.meta.url);
const probeNodeModules =
  process.env.PLATE_HTML_PROBE_NODE_MODULES ??
  join(root, 'node_modules/.pnpm/node_modules');
const parse5Path = realpathSync(
  require.resolve('parse5', { paths: [probeNodeModules] })
);
let parse5Root = dirname(parse5Path);
let parse5Package: { version: string } | undefined;

while (true) {
  try {
    const candidate = JSON.parse(
      readFileSync(join(parse5Root, 'package.json'), 'utf8')
    );

    if (candidate.name === 'parse5' && candidate.version) {
      parse5Package = candidate;
      break;
    }
  } catch {}
  const parent = dirname(parse5Root);

  if (parent === parse5Root) throw new Error('Cannot locate parse5 package.');
  parse5Root = parent;
}

if (parse5Package?.version !== '8.0.1') {
  throw new Error(
    `Expected parse5 8.0.1, received ${parse5Package.version}. Set PLATE_HTML_PROBE_NODE_MODULES to an exact research install.`
  );
}
const { parse, serialize } = await import(pathToFileURL(parse5Path).href);

const conformanceCases = Object.freeze({
  attributes: '<p b="2" a="1" a="3">x</p>',
  comment: '<!--a--><p>x<!--b--></p>',
  foreign: '<svg><foreignObject><div>x</div></foreignObject></svg>',
  fosterParenting: '<table>before<tr><td>x</td></tr>after</table>',
  impliedParagraphClose: '<p>a<div>b</div>c',
  misnestedFormatting: '<b><i>x</b>y</i>',
  plain: '<p>Hello <em>world</em></p>',
  rawText: '<script>if (a < b) x()</script><style>a>b{color:red}</style>',
  tableRepair: '<table><tr><td>x</table>tail',
  template: '<template><tr><td>x</td></tr></template>',
});

const parseServerHtml = (source: string) => {
  const syntaxTree = parse(source);
  const canonical = serialize(syntaxTree);
  const document = new DOMParser().parseFromString(canonical, 'text/html');

  if (!document) throw new Error('LinkeDOM returned no document.');

  return { canonical, document };
};

const conformance = Object.entries(conformanceCases).map(([name, source]) => {
  const { canonical, document } = parseServerHtml(source);
  const after = serialize(parse(document.toString()));

  if (after !== canonical) {
    throw new Error(`${name}: LinkeDOM changed the parse5 canonical tree.`);
  }

  return Object.freeze({
    canonicalSha256: createHash('sha256').update(canonical).digest('hex'),
    name,
  });
});

const conversionCases = Object.freeze([
  Object.freeze({
    expected: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
    name: 'simple',
    source: '<p>Hello</p>',
  }),
  Object.freeze({
    expected: [
      { children: [{ text: 'A line\nbreak right here' }], type: 'paragraph' },
    ],
    name: 'inline-whitespace',
    source:
      '<p>A <span>line</span><br>break <a href="#">right here</a></p>',
  }),
  Object.freeze({
    expected: [
      { children: [{ text: 'a' }], type: 'paragraph' },
      { children: [{ text: 'b' }], type: 'paragraph' },
      { children: [{ text: 'c' }], type: 'paragraph' },
    ],
    name: 'repaired-paragraph',
    source: '<p>a<div>b</div>c',
  }),
  Object.freeze({
    expected: [
      { children: [{ text: 'x' }], type: 'paragraph' },
      { children: [{ text: 'tail' }], type: 'paragraph' },
    ],
    name: 'repaired-table-without-table-plugin',
    source: '<table><tr><td>x</table>tail',
  }),
  Object.freeze({
    expected: [{ children: [{ text: 'xy' }], type: 'paragraph' }],
    name: 'misnested-formatting-without-mark-plugins',
    source: '<b><i>x</b>y</i>',
  }),
  Object.freeze({
    expected: [{ children: [{ text: 'safelink' }], type: 'paragraph' }],
    expectedDiagnostic: 'html-unsafe-content',
    name: 'unsafe-content',
    source:
      '<p>safe<script>globalThis.__plateServerProbe = true</script><a href="javascript:bad()">link</a></p>',
  }),
]);
const conversion = conversionCases.map(
  ({ expected, expectedDiagnostic, name, source }) => {
    const result = parsePlateHtml(source, { plugins: [BaseParagraphPlugin] });

    if (!result.ok) {
      throw new Error(
        `${name}: Plate conversion failed. ${JSON.stringify(result.diagnostics)}`
      );
    }
    const actual = result.document.children;

    if (
      expectedDiagnostic &&
      !result.diagnostics.some(
        (diagnostic) => diagnostic.code === expectedDiagnostic
      )
    ) {
      throw new Error(`${name}: missing ${expectedDiagnostic} diagnostic.`);
    }

    if (!isDeepStrictEqual(actual, expected)) {
      throw new Error(
        `${name}: Plate conversion mismatch. ${JSON.stringify({ actual, expected })}`
      );
    }

    return Object.freeze({
      diagnostics: result.diagnostics.map(({ code }) => code),
      name,
      nodes: actual.length,
    });
  }
);

const AlignedParagraphPlugin = definePlugin('alignedParagraph', {
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => ({
          align: element.dataset.align,
          color: element.style.color,
        }),
        encode: ({ children }) => ({ children, tag: 'p' }),
        match: [{ tag: 'p' }],
        priority: 1,
      },
    }),
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        align: property.string(),
        color: property.string(),
      },
    },
  },
});
const customResult = parsePlateHtml(
  '<p data-align="center" style="color: red">Mapped</p>',
  {
    plugins: [AlignedParagraphPlugin],
    schema: {
      root: schema.content.element(AlignedParagraphPlugin, { min: 1 }),
    },
  }
);

if (!customResult.ok) {
  throw new Error(
    `Custom Plate conversion failed: ${JSON.stringify(customResult.diagnostics)}`
  );
}
const customMapping = customResult.document.children;
const expectedCustomMapping = [
  {
    align: 'center',
    children: [{ text: 'Mapped' }],
    color: 'red',
    type: 'alignedParagraph',
  },
];

if (!isDeepStrictEqual(customMapping, expectedCustomMapping)) {
  throw new Error(
    `LinkeDOM did not satisfy the feature mapping DOM contract: ${JSON.stringify(customMapping)}`
  );
}
if (globalThis.__plateServerProbe !== undefined) {
  throw new Error('Server HTML evaluated source JavaScript.');
}

const output = Object.freeze({
  candidate: {
    linkedomCommit: 'fcd88e02b6dd3e616f5de512b15713b663d16ab7',
    parse5: parse5Package.version,
    plate: '6a6e8f660f10ede916b90e90b2849e02d95e7d84',
  },
  conformance,
  conversion,
  customMapping,
  limitations: [
    'The complete Word paste, declaration, SSR, and packed-consumer suites remain separate implementation proof.',
    'The synthetic corpus is a focused architecture guard, not the parse5 conformance suite.',
  ],
  result: 'pass',
  sourceFingerprint: createHash('sha256')
    .update(readFileSync(import.meta.filename))
    .digest('hex'),
});

writeFileSync(
  join(
    root,
    'docs/plite/research/2026-09-25-document-codec-architecture/html-server-parse5-linkedom-correctness.json'
  ),
  `${JSON.stringify(output, null, 2)}\n`
);
console.log('html-server-parse5-linkedom-correctness: pass');
