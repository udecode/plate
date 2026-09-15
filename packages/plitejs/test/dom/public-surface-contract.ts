import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createEditor } from 'plitejs';

import * as DOMModule from '../../src/dom';

const packageJsonPath = fileURLToPath(
  new URL('../../package.json', import.meta.url)
);
const tsdownConfigPath = fileURLToPath(
  new URL('../../tsdown.config.mts', import.meta.url)
);
const domDocsPath = fileURLToPath(
  new URL('../../../../content/docs/api/dom.mdx', import.meta.url)
);
const coverageDocsPath = fileURLToPath(
  new URL('../../../../content/docs/(guides)/dom-coverage.mdx', import.meta.url)
);

const typePrefixPattern = /^type\s+/;
const exportAliasSplitPattern = /\s+as\s+/;
const immediateJsdocPattern = /\/\*\*[\s\S]*?\*\/\s*$/;
const readmeDomFocusPattern = /editor\.api\.dom\.focus\(\)/;
const readmeClipboardPattern = /editor\.api\.dom\.clipboard\.insertTextData/;
const readmeRootImportPattern =
  /import \{ createEditor \} from ['"]platejs\/react['"]/;
const tsdownRootEntryPattern = /index:\s*'src\/index\.ts'/;
const tsdownDOMEntryPattern = /'dom\/index':\s*'src\/dom\/index\.ts'/;
const defaultHotkeysAliasPattern = /default as Hotkeys/;
const hotkeysNamedExportPattern = /export const Hotkeys =/;
const defaultExportPattern = /export default/;
const tryPrefixPattern = /^try/i;

const extractDocumentedCapabilityMethods = (
  source: string,
  capability: 'clipboard' | 'dom'
) => {
  const capabilityPath =
    capability === 'clipboard' ? 'dom\\.clipboard' : capability;

  return [
    ...source.matchAll(
      new RegExp(
        `#### \`editor\\.api\\.${capabilityPath}\\.([A-Za-z0-9_]+)(?=\\(|\`)`,
        'g'
      )
    ),
  ]
    .map((match) => match[1])
    .sort();
};

const expectedDOMRuntimeRootExports = [
  'CAN_USE_DOM',
  'DOMCoverage',
  'DOMEditor',
  'Hotkeys',
  'Key',
  'DOMResolutionError',
  'TRIPLE_CLICK',
  'applyStringDiff',
  'closestShadowAware',
  'containsShadowAware',
  'createCompiledHotkeyMatcher',
  'dom',
  'domCommands',
  'getActiveElement',
  'getDOMClipboardFormatKey',
  'getDefaultView',
  'getEditorDOMRoot',
  'getElements',
  'getNodeDataAttributeKeys',
  'getSelection',
  'hasShadowRoot',
  'hostCodecs',
  'isAfter',
  'isBefore',
  'isDOMElement',
  'isDOMNode',
  'isDOMSelection',
  'isDOMText',
  'isEditor',
  'isElement',
  'isGeckoDOMHost',
  'isHotkey',
  'isLeaf',
  'isNode',
  'isPlainTextOnlyPaste',
  'isString',
  'isText',
  'isTrackedMutation',
  'isVoid',
  'keyToDataAttribute',
  'mergeStringDiffs',
  'normalizeDOMPoint',
  'normalizePoint',
  'normalizeRange',
  'normalizeStringDiff',
  'parseDOMClipboardHtml',
  'targetRange',
  'usesAppleDOMHotkeys',
  'verifyDiffState',
  'writeDOMFragmentData',
  'writeDOMRangeData',
  'writeHostFragmentData',
];

describe('DOM public surface contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(DOMModule).sort(),
      expectedDOMRuntimeRootExports.toSorted()
    );
  });

  it('keeps explicit public root exports documented in source', () => {
    const sourceRoot = fileURLToPath(new URL('../../src/dom', import.meta.url));
    const indexSource = readFileSync(
      fileURLToPath(new URL('../../src/dom/index.ts', import.meta.url)),
      'utf-8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const sourcePath = `${sourceRoot}/${sourceSpecifier.replace(/^\.\//, '')}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

      for (const rawName of rawNames.split(',')) {
        const name = rawName
          .trim()
          .replace(typePrefixPattern, '')
          .split(exportAliasSplitPattern)[0]
          ?.trim();

        if (!name) {
          continue;
        }

        const isType = rawName.trim().startsWith('type ');
        const declaration = new RegExp(
          isType
            ? `export\\s+(?:interface|type)\\s+${name}\\b`
            : `export\\s+(?:const|function|class)\\s+${name}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!immediateJsdocPattern.test(beforeDeclaration)) {
          missing.push(`${name}: missing immediate source JSDoc`);
        }
      }
    }

    assert.deepEqual(missing, []);
  });

  it('documents mounted DOM services and component-owned coverage', () => {
    const docs = readFileSync(domDocsPath, 'utf-8');
    const coverage = readFileSync(coverageDocsPath, 'utf-8');

    assert.match(docs, readmeDomFocusPattern);
    assert.match(docs, readmeClipboardPattern);
    assert.match(docs, readmeRootImportPattern);
    assert.match(coverage, /slots\.contentBoundary/);
    assert.match(
      coverage,
      /Each mounted editor surface owns an independent coverage session/
    );
    assert.match(
      coverage,
      /onMaterialize\(\{ boundary, reason, range, rangeRole \}\)/
    );
    for (const policy of ['skip', 'model', 'materialize', 'exclude']) {
      assert.ok(
        coverage.includes(`\`${policy}\``),
        `${policy} should be documented`
      );
    }
  });

  it('documents application host utilities and DOM primitive types', () => {
    const docs = readFileSync(domDocsPath, 'utf-8');

    for (const name of [
      'platejs/dom',
      'isHotkey',
      'domCommands',
      'hostCodecs',
      'parseDOMClipboardHtml',
      'writeHostFragmentData',
      'DOMResolutionError',
      'DOMApi',
      'DOMClipboardApi',
      'DOMNode',
      'DOMElement',
      'DOMText',
      'DOMPoint',
      'DOMRange',
      'DOMStaticRange',
      'DOMSelection',
    ]) {
      assert.ok(docs.includes(name), `${name} should be named in docs`);
    }
  });

  it('publishes root export declarations through the export map', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      description: string;
      exports: Record<string, unknown>;
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.description,
      'A headless-first framework for building rich text editors.'
    );
    assert.deepEqual(packageJson.exports['./dom'], {
      types: './dist/dom/index.d.ts',
      import: './dist/dom/index.js',
      default: './dist/dom/index.js',
    });
    assert.deepEqual(packageJson.exports['./internal'], {
      types: './dist/internal/index.d.ts',
      import: './dist/internal/index.js',
      default: './dist/internal/index.js',
    });
    assert.equal(
      packageJson.scripts.build,
      'tsdown --config tsdown.config.mts --log-level warn'
    );
  });

  it('keeps exported package subpaths backed by build entries', () => {
    const tsdownConfig = readFileSync(tsdownConfigPath, 'utf-8');

    assert.match(tsdownConfig, tsdownRootEntryPattern);
    assert.match(tsdownConfig, tsdownDOMEntryPattern);
  });

  it('keeps DOMEditor public without exposing the old wrapper', () => {
    assert.equal('DOMEditor' in DOMModule, true);
    assert.equal('withDOM' in DOMModule, false);
    assert.equal(typeof DOMModule.dom, 'function');
  });

  it('keeps weak-map runtime state out of the public root at runtime', () => {
    for (const name of [
      'EDITOR_TO_ELEMENT',
      'EDITOR_TO_FORCE_RENDER',
      'EDITOR_TO_KEY_TO_ELEMENT',
      'EDITOR_TO_PENDING_ACTION',
      'EDITOR_TO_PENDING_DIFFS',
      'EDITOR_TO_PENDING_INSERTION_MARKS',
      'EDITOR_TO_PENDING_SELECTION',
      'EDITOR_TO_PLACEHOLDER_ELEMENT',
      'EDITOR_TO_ROOT_VIEW_EDITORS',
      'EDITOR_TO_SCHEDULE_FLUSH',
      'EDITOR_TO_USER_MARKS',
      'EDITOR_TO_USER_SELECTION',
      'EDITOR_TO_WINDOW',
      'ELEMENT_TO_NODE',
      'IS_COMPOSING',
      'IS_FOCUSED',
      'IS_NODE_MAP_DIRTY',
      'IS_READ_ONLY',
      'MARK_PLACEHOLDER_SYMBOL',
      'NODE_TO_ELEMENT',
      'NODE_TO_INDEX',
      'NODE_TO_KEY',
      'NODE_TO_PARENT',
      'NODE_TO_RUNTIME_ID',
      'PLACEHOLDER_SYMBOL',
    ]) {
      assert.equal(name in DOMModule, false, `${name} must stay internal`);
    }
  });

  it('keeps the public dom capability surface explicit', () => {
    const editor = createEditor({ plugins: [DOMModule.dom()] });

    assert.deepEqual(
      Object.keys(editor.api.dom).sort(),
      [
        'assertDOMNode',
        'assertDOMPoint',
        'assertDOMRange',
        'assertEventRange',
        'assertPath',
        'assertNode',
        'assertPoint',
        'assertRange',
        'blur',
        'clipboard',
        'deselect',
        'editable',
        'findDocumentOrShadowRoot',
        'findKey',
        'focus',
        'getWindow',
        'hasDOMNode',
        'hasEditableTarget',
        'hasRange',
        'hasSelectableTarget',
        'hasTarget',
        'isComposing',
        'isFocused',
        'isReadOnly',
        'isTargetInsideNonReadonlyVoid',
        'resolveDOMNode',
        'resolveDOMPoint',
        'resolveDOMRange',
        'resolveEventRange',
        'resolvePath',
        'resolveRangeRect',
        'resolveVisualPoint',
        'root',
        'scroll',
        'scrollIntoView',
        'resolveNode',
        'resolvePoint',
        'resolveRange',
      ].sort()
    );
  });

  it('keeps React DOM API docs aligned to the runtime capability surface', () => {
    const editor = createEditor({ plugins: [DOMModule.dom()] });

    const docs = readFileSync(domDocsPath, 'utf-8');

    assert.deepEqual(
      [...extractDocumentedCapabilityMethods(docs, 'dom'), 'clipboard'].sort(),
      Object.keys(editor.api.dom).sort()
    );
    assert.deepEqual(
      extractDocumentedCapabilityMethods(docs, 'clipboard'),
      Object.keys(editor.api.dom.clipboard).sort()
    );
  });

  it('publishes DOM coverage boundaries for public examples and docs', () => {
    assert.equal(typeof DOMModule.DOMCoverage, 'object');
    const coverage = DOMModule.DOMCoverage.create(createEditor());
    assert.equal(typeof coverage.registerBoundary, 'function');
    assert.equal(typeof coverage.getBoundaries, 'function');
    assert.equal(typeof coverage.materializeBoundary, 'function');
    coverage.destroy();
  });

  it('publishes Hotkeys as a named export without a default-export alias', () => {
    const rootSource = readFileSync(
      fileURLToPath(new URL('../../src/dom/index.ts', import.meta.url)),
      'utf-8'
    );
    const hotkeySource = readFileSync(
      fileURLToPath(new URL('../../src/dom/utils/hotkeys.ts', import.meta.url)),
      'utf-8'
    );

    assert.equal(typeof DOMModule.Hotkeys, 'object');
    assert.equal(typeof DOMModule.Hotkeys.isUndo, 'function');
    assert.doesNotMatch(rootSource, defaultHotkeysAliasPattern);
    assert.match(hotkeySource, hotkeysNamedExportPattern);
    assert.doesNotMatch(hotkeySource, defaultExportPattern);
  });

  it('treats nodes from torn down DOM views as non-DOM values', () => {
    const tornDownTextNode = {
      nodeType: 3,
      ownerDocument: {
        defaultView: {},
      },
    };

    assert.doesNotThrow(() => DOMModule.isDOMNode(tornDownTextNode));
    assert.equal(DOMModule.isDOMNode(tornDownTextNode), false);
    assert.equal(DOMModule.isDOMText(tornDownTextNode), false);
  });

  it('exposes nullable resolver methods without try-style aliases', () => {
    const editor = createEditor({ plugins: [DOMModule.dom()] });
    const resolverNames = [
      'resolveDOMNode',
      'resolveDOMPoint',
      'resolveDOMRange',
      'resolveEventRange',
      'resolvePath',
      'resolveRangeRect',
      'resolveNode',
      'resolvePoint',
      'resolveRange',
    ];

    for (const name of resolverNames) {
      assert.equal(
        typeof editor.api.dom[name as keyof typeof editor.api.dom],
        'function'
      );
    }

    for (const name of Object.keys(editor.api.dom)) {
      assert.equal(
        tryPrefixPattern.test(name),
        false,
        `${name} must not use try* naming`
      );
    }
  });

  it('keeps Android text-repair internals off the public dom capability', () => {
    const editor = createEditor({ plugins: [DOMModule.dom()] });

    assert.equal('androidPendingDiffs' in editor.api.dom, false);
    assert.equal('androidScheduleFlush' in editor.api.dom, false);
  });

  it('uses resolve/assert names for DOM mapping contracts', () => {
    const editor = createEditor({ plugins: [DOMModule.dom()] });
    const assertNames = [
      'assertDOMNode',
      'assertDOMPoint',
      'assertDOMRange',
      'assertEventRange',
      'assertPath',
      'assertNode',
      'assertPoint',
      'assertRange',
    ];
    const removedStrictMappingNames = [
      'findEventRange',
      'findPath',
      'toDOMNode',
      'toDOMPoint',
      'toDOMRange',
      'toPliteNode',
      'toPlitePoint',
      'toPliteRange',
    ];

    for (const name of assertNames) {
      assert.equal(
        typeof editor.api.dom[name as keyof typeof editor.api.dom],
        'function',
        `${name} should expose the assertion contract`
      );
    }

    for (const name of removedStrictMappingNames) {
      assert.equal(
        name in editor.api.dom,
        false,
        `${name} should not be public DOM mapping API`
      );
    }
  });
});
