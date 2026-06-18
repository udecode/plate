import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createEditor } from '@platejs/slate';

import * as SlateDOM from '../src';

const packageJsonPath = fileURLToPath(
  new URL('../package.json', import.meta.url)
);
const tsdownConfigPath = fileURLToPath(
  new URL('../tsdown.config.mts', import.meta.url)
);
const reactEditorDocsPath = fileURLToPath(
  new URL(
    '../../../docs/libraries/slate-react/react-editor.md',
    import.meta.url
  )
);
const slateDomDocsPath = fileURLToPath(
  new URL('../../../docs/libraries/slate-dom.md', import.meta.url)
);

const extractDocumentedCapabilityMethods = (
  source: string,
  capability: 'clipboard' | 'dom'
) =>
  [
    ...source.matchAll(
      new RegExp(`#### \`editor\\.api\\.${capability}\\.([A-Za-z0-9_]+)`, 'g')
    ),
  ]
    .map((match) => match[1])
    .sort();

const expectedSlateDOMRuntimeRootExports = [
  'CAN_USE_DOM',
  'DOMCoverage',
  'HAS_BEFORE_INPUT_SUPPORT',
  'Hotkeys',
  'IS_ANDROID',
  'IS_CHROME',
  'IS_FIREFOX',
  'IS_IOS',
  'IS_UC_MOBILE',
  'IS_WEBKIT',
  'IS_WECHATBROWSER',
  'Key',
  'SlateDOMResolutionError',
  'TRIPLE_CLICK',
  'applyStringDiff',
  'closestShadowAware',
  'containsShadowAware',
  'dom',
  'getActiveElement',
  'getDefaultView',
  'getSelection',
  'hasShadowRoot',
  'isAfter',
  'isBefore',
  'isDOMElement',
  'isDOMNode',
  'isDOMSelection',
  'isDOMText',
  'isElementDecorationsEqual',
  'isHotkey',
  'isPlainTextOnlyPaste',
  'isTextDecorationsEqual',
  'isTrackedMutation',
  'mergeStringDiffs',
  'normalizeDOMPoint',
  'normalizePoint',
  'normalizeRange',
  'normalizeStringDiff',
  'splitDecorationsByChild',
  'targetRange',
  'verifyDiffState',
];

describe('slate-dom public surface contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(SlateDOM).sort(),
      expectedSlateDOMRuntimeRootExports
    );
  });

  it('keeps explicit public root exports documented in source', () => {
    const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
    const indexSource = readFileSync(
      fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      'utf8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const sourcePath = `${sourceRoot}${sourceSpecifier}.ts`;
      const source = readFileSync(sourcePath, 'utf8');

      for (const rawName of rawNames.split(',')) {
        const name = rawName
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
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

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(`${name}: missing immediate source JSDoc`);
        }
      }
    }

    assert.deepEqual(missing, []);
  });

  it('keeps the package README aligned to the public DOM and coverage APIs', () => {
    const readme = readFileSync(
      fileURLToPath(new URL('../README.md', import.meta.url)),
      'utf8'
    );

    assert.match(readme, /editor\.api\.dom\.focus\(\)/);
    assert.match(readme, /editor\.api\.clipboard\.insertTextData/);
    assert.match(
      readme,
      /import \{ DOMCoverage, Hotkeys, isDOMNode \} from '@platejs\/slate-dom'/
    );
    assert.match(readme, /DOM coverage boundaries model same-root content/);
    assert.match(readme, /Framework packages own bridge installation/);
  });

  it('keeps grouped root utility exports named in package docs', () => {
    const docs = [
      readFileSync(
        fileURLToPath(new URL('../README.md', import.meta.url)),
        'utf8'
      ),
      existsSync(slateDomDocsPath)
        ? readFileSync(slateDomDocsPath, 'utf8')
        : readFileSync(
            fileURLToPath(new URL('../src/index.ts', import.meta.url)),
            'utf8'
          ),
    ].join('\n');

    for (const name of [
      'dom()',
      'DOMCoverage',
      'Hotkeys',
      'isHotkey',
      'Key',
      'TRIPLE_CLICK',
      'closestShadowAware',
      'containsShadowAware',
      'getActiveElement',
      'getDefaultView',
      'getSelection',
      'hasShadowRoot',
      'isAfter',
      'isBefore',
      'isDOMElement',
      'isDOMNode',
      'isDOMSelection',
      'isDOMText',
      'isPlainTextOnlyPaste',
      'isTrackedMutation',
      'normalizeDOMPoint',
      'applyStringDiff',
      'mergeStringDiffs',
      'normalizePoint',
      'normalizeRange',
      'normalizeStringDiff',
      'targetRange',
      'verifyDiffState',
      'CAN_USE_DOM',
      'HAS_BEFORE_INPUT_SUPPORT',
      'IS_ANDROID',
      'IS_CHROME',
      'IS_FIREFOX',
      'IS_IOS',
      'IS_UC_MOBILE',
      'IS_WEBKIT',
      'IS_WECHATBROWSER',
      'isElementDecorationsEqual',
      'isTextDecorationsEqual',
      'splitDecorationsByChild',
      'SlateDOMResolutionError',
      'DOMApi',
      'DOMClipboardApi',
      'DOMClipboardInsertDataHandler',
      'DOMEditorOptions',
      'DOMCoverageBoundary',
      'DOMCoverageSelectionPolicy',
      'DOMCoverageSlatePointResult',
      'DOMCoverageDOMRangeResult',
      'DOMNode',
      'DOMElement',
      'DOMText',
      'DOMPoint',
      'DOMRange',
      'DOMStaticRange',
      'DOMSelection',
      'HotkeySpec',
      'HotkeyPlatform',
      'HotkeyMatchOptions',
      'KeyboardEventLike',
      'StringDiff',
      'TextDiff',
    ]) {
      assert.ok(docs.includes(name), `${name} should be named in docs`);
    }
  });

  it('publishes root export declarations through the export map', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      description: string;
      exports: Record<string, unknown>;
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.description,
      'DOM bridge and browser utilities for Slate editors.'
    );
    assert.deepEqual(packageJson.exports['.'], {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    });
    assert.deepEqual(packageJson.exports['./internal'], {
      types: './dist/internal/index.d.ts',
      import: './dist/internal/index.js',
      default: './dist/internal/index.js',
    });
    assert.equal(
      packageJson.scripts.build,
      'tsdown --config ./tsdown.config.mts --log-level warn'
    );
  });

  it('keeps exported package subpaths backed by build entries', () => {
    const tsdownConfig = readFileSync(tsdownConfigPath, 'utf8');

    assert.match(tsdownConfig, /index:\s*'src\/index\.ts'/);
    assert.match(
      tsdownConfig,
      /'internal\/index':\s*'src\/internal\/index\.ts'/
    );
  });

  it('keeps the internal DOMEditor static namespace out of the public root at runtime', () => {
    assert.equal('DOMEditor' in SlateDOM, false);
    assert.equal('withDOM' in SlateDOM, false);
    assert.equal(typeof SlateDOM.dom, 'function');
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
      assert.equal(name in SlateDOM, false, `${name} must stay internal`);
    }
  });

  it('keeps the public dom capability surface explicit', () => {
    const editor = createEditor({ extensions: [SlateDOM.dom()] });

    assert.deepEqual(Object.keys(editor.api.dom).sort(), [
      'assertDOMNode',
      'assertDOMPoint',
      'assertDOMRange',
      'assertEventRange',
      'assertPath',
      'assertSlateNode',
      'assertSlatePoint',
      'assertSlateRange',
      'blur',
      'deselect',
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
      'resolveSlateNode',
      'resolveSlatePoint',
      'resolveSlateRange',
    ]);
  });

  it('keeps React DOM API docs aligned to the runtime capability surface', () => {
    const editor = createEditor({ extensions: [SlateDOM.dom()] });

    if (!existsSync(reactEditorDocsPath)) {
      assert.deepEqual(Object.keys(editor.api.dom).sort(), [
        'assertDOMNode',
        'assertDOMPoint',
        'assertDOMRange',
        'assertEventRange',
        'assertPath',
        'assertSlateNode',
        'assertSlatePoint',
        'assertSlateRange',
        'blur',
        'deselect',
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
        'resolveSlateNode',
        'resolveSlatePoint',
        'resolveSlateRange',
      ]);
      assert.deepEqual(Object.keys(editor.api.clipboard).sort(), [
        'insertData',
        'insertFragmentData',
        'insertTextData',
        'writeSelection',
      ]);
      return;
    }

    const docs = readFileSync(reactEditorDocsPath, 'utf8');

    assert.deepEqual(
      extractDocumentedCapabilityMethods(docs, 'dom'),
      Object.keys(editor.api.dom).sort()
    );
    assert.deepEqual(
      extractDocumentedCapabilityMethods(docs, 'clipboard'),
      Object.keys(editor.api.clipboard).sort()
    );
  });

  it('publishes DOM coverage boundaries for public examples and docs', () => {
    assert.equal(typeof SlateDOM.DOMCoverage, 'object');
    assert.equal(typeof SlateDOM.DOMCoverage.registerBoundary, 'function');
    assert.equal(typeof SlateDOM.DOMCoverage.getBoundaries, 'function');
    assert.equal(typeof SlateDOM.DOMCoverage.materializeBoundary, 'function');
  });

  it('publishes Hotkeys as a named export without a default-export alias', () => {
    const rootSource = readFileSync(
      fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      'utf8'
    );
    const hotkeySource = readFileSync(
      fileURLToPath(new URL('../src/utils/hotkeys.ts', import.meta.url)),
      'utf8'
    );

    assert.equal(typeof SlateDOM.Hotkeys, 'object');
    assert.equal(typeof SlateDOM.Hotkeys.isUndo, 'function');
    assert.doesNotMatch(rootSource, /default as Hotkeys/);
    assert.match(hotkeySource, /export const Hotkeys =/);
    assert.doesNotMatch(hotkeySource, /export default/);
  });

  it('treats nodes from torn down DOM views as non-DOM values', () => {
    const tornDownTextNode = {
      nodeType: 3,
      ownerDocument: {
        defaultView: {},
      },
    };

    assert.doesNotThrow(() => SlateDOM.isDOMNode(tornDownTextNode));
    assert.equal(SlateDOM.isDOMNode(tornDownTextNode), false);
    assert.equal(SlateDOM.isDOMText(tornDownTextNode), false);
  });

  it('exposes nullable resolver methods without try-style aliases', () => {
    const editor = createEditor({ extensions: [SlateDOM.dom()] });
    const resolverNames = [
      'resolveDOMNode',
      'resolveDOMPoint',
      'resolveDOMRange',
      'resolveEventRange',
      'resolvePath',
      'resolveRangeRect',
      'resolveSlateNode',
      'resolveSlatePoint',
      'resolveSlateRange',
    ];

    for (const name of resolverNames) {
      assert.equal(
        typeof editor.api.dom[name as keyof typeof editor.api.dom],
        'function'
      );
    }

    for (const name of Object.keys(editor.api.dom)) {
      assert.equal(
        /^try/i.test(name),
        false,
        `${name} must not use try* naming`
      );
    }
  });

  it('keeps Android text-repair internals off the public dom capability', () => {
    const editor = createEditor({ extensions: [SlateDOM.dom()] });

    assert.equal('androidPendingDiffs' in editor.api.dom, false);
    assert.equal('androidScheduleFlush' in editor.api.dom, false);
  });

  it('uses resolve/assert names for DOM mapping contracts', () => {
    const editor = createEditor({ extensions: [SlateDOM.dom()] });
    const assertNames = [
      'assertDOMNode',
      'assertDOMPoint',
      'assertDOMRange',
      'assertEventRange',
      'assertPath',
      'assertSlateNode',
      'assertSlatePoint',
      'assertSlateRange',
    ];
    const removedStrictMappingNames = [
      'findEventRange',
      'findPath',
      'toDOMNode',
      'toDOMPoint',
      'toDOMRange',
      'toSlateNode',
      'toSlatePoint',
      'toSlateRange',
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
