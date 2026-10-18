import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { RuleTester } from 'oxlint/plugins-dev';

import plugin, { noAsNever, withBaseline } from './plate-plugin.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { sourceType: 'module' },
});
const ts = (code) => ({
  code,
  filename: fileURLToPath(new URL('case.ts', import.meta.url)),
});
const at = (file, code) => ({
  code,
  filename: fileURLToPath(new URL(`../../${file}`, import.meta.url)),
});
const plite = (code) => at('packages/plitejs/src/case.tsx', code);
const plate = (code) => at('packages/platejs/src/case.tsx', code);
const inDays = (days) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const exception = (date) =>
  `// oxlint-disable-next-line plate/no-as-never -- legacy cast; expires ${date}; approved zbeyens`;

// Each hash names the commit where an agent made the mistake its case
// reproduces.
describe('plate oxlint rules', () => {
  tester.run(
    'no-annotated-inferred-callback',
    plugin.rules['no-annotated-inferred-callback'],
    {
      invalid: [
        {
          // f431866376
          ...ts(
            'context.editor.update((tx: EditorUpdateTransaction) => { tx.operations.replay(ops); });'
          ),
          errors: [{ messageId: 'annotated' }],
        },
      ],
      valid: [
        ts('context.editor.update((tx) => { tx.operations.replay(ops); });'),
        ts(
          'editor.update(\n  // @ts-expect-error an annotated callback cannot forge transaction capabilities\n  (tx: { forged: () => void }) => tx.forged()\n);'
        ),
      ],
    }
  );

  tester.run('mock-spreads-module', plugin.rules['mock-spreads-module'], {
    invalid: [
      {
        // 0689161e6a broke this mock by importing ElementApi in code-block.tsx
        ...ts(
          "mock.module('platejs', () => ({ NodeApi: { string: () => 'code' } }));"
        ),
        errors: [{ messageId: 'partial' }],
      },
    ],
    valid: [
      ts(
        "import * as actual from 'platejs';\nmock.module('platejs', () => ({ ...actual, NodeApi: { string: () => 'code' } }));"
      ),
      ts("mock.module('@/lib/utils', () => ({ cn: () => '' }));"),
    ],
  });

  tester.run('no-raised-test-timeout', plugin.rules['no-raised-test-timeout'], {
    invalid: [
      {
        // f2c7592235
        ...ts("it('scales to 5000 blocks', () => {}, { timeout: 30_000 });"),
        errors: [{ messageId: 'raised' }],
      },
      {
        // 5104eb406f
        ...ts(
          "it('keeps lookups sparse at 50k owners', { timeout: 20_000 }, () => {});"
        ),
        errors: [{ messageId: 'raised' }],
      },
    ],
    valid: [ts("it('visits owners', () => {}, { timeout: 5000 });")],
  });

  tester.run(
    'no-inline-hydration-flag',
    plugin.rules['no-inline-hydration-flag'],
    {
      invalid: [
        {
          // efa5a8a36e, the paged view's measurement gate
          ...ts(
            'const subscribeNothing = () => () => {};\nconst canMeasure = useSyncExternalStore(subscribeNothing, () => true, () => false);'
          ),
          errors: [{ messageId: 'inline' }],
        },
        {
          // dc927288b2, Editable's hydration flag through module constants
          ...ts(
            'const subscribeHydration = () => () => {};\nconst getClientHydrationSnapshot = () => true;\nconst getServerHydrationSnapshot = () => false;\nconst hydrated = useSyncExternalStore(subscribeHydration, getClientHydrationSnapshot, getServerHydrationSnapshot);'
          ),
          errors: [{ messageId: 'inline' }],
        },
        {
          // dc927288b2, editable-text-blocks.tsx through React's namespace
          ...ts(
            'const hasClientDOM = React.useSyncExternalStore(subscribeClientDOM, () => true, function () { return false; });'
          ),
          errors: [{ messageId: 'inline' }],
        },
        {
          ...ts(
            'function useReady() {\n  function getClientSnapshot() { return true; }\n  const getServerSnapshot = () => false;\n  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);\n}'
          ),
          errors: [{ messageId: 'inline' }],
        },
      ],
      valid: [
        ts('const hydrated = useHydrated();'),
        ts(
          'function useOnline(store) {\n  let getSnapshot = () => true;\n  if (store) getSnapshot = () => store.online;\n  return useSyncExternalStore(store?.subscribe ?? subscribeNothing, getSnapshot, () => false);\n}'
        ),
        ts(
          'function useStore(store) {\n  let getClientSnapshot = () => true;\n  if (store.getSnapshot) getClientSnapshot = store.getSnapshot;\n  return useSyncExternalStore(store.subscribe, getClientSnapshot, () => false);\n}'
        ),
        ts(
          'function pick(getClient) {\n  return true;\n  function inner() {\n    useSyncExternalStore(subscribe, getClient, () => false);\n  }\n}'
        ),
        ts(
          // A parameter shadows a module snapshot
          'const getClient = () => true;\nconst getServer = () => false;\nfunction useHostFact(getClient) {\n  return useSyncExternalStore(subscribeHostFacts, getClient, getServer);\n}'
        ),
        ts(
          'const getSnapshot = () => true;\nfunction useOnline(store) {\n  const getSnapshot = () => store.online;\n  return useSyncExternalStore(store.subscribe, getSnapshot, () => false);\n}'
        ),
        ts(
          'const supportsBeforeInput = useSyncExternalStore(runtime.subscribeHostFacts, () => runtime.supportsBeforeInput, () => false);'
        ),
      ],
    }
  );

  tester.run('no-selection-root-copy', plugin.rules['no-selection-root-copy'], {
    invalid: [
      {
        ...ts("if ('anchor' in at) return at.anchor.root;"),
        errors: [{ messageId: 'copy' }],
      },
      {
        ...ts('const root = selection?.focus?.root;'),
        errors: [{ messageId: 'copy' }],
      },
      {
        ...ts("const root = range.anchor['root'] ?? range.focus.root;"),
        errors: [{ messageId: 'copy' }, { messageId: 'copy' }],
      },
      {
        ...ts('const { root } = range.anchor;'),
        errors: [{ messageId: 'copy' }],
      },
      {
        ...ts('const { anchor: { root } } = range;'),
        errors: [{ messageId: 'copy' }],
      },
    ],
    valid: [
      ts('const root = SelectionApi.root(range);'),
      ts("return 'root' in at ? at.root : undefined;"),
      ts('const { root } = point;'),
      ts('const path = range.anchor.path;'),
      ts(
        'if (!selection || selection.anchor.root !== selection.focus.root) return null;'
      ),
      ts(
        'const same = selection?.anchor.root === root && selection.focus.root === root;'
      ),
    ],
  });

  tester.run(
    'no-schema-placement-copy',
    plugin.rules['no-schema-placement-copy'],
    {
      invalid: [
        {
          // 93cdf6628a, wholeTextBlocks in aiOutputLanding.internal.ts
          ...ts(
            'const content = parent && state.schema.element(parent.type)?.content;\nif (!parent || !content || content.prefix) {}\nconst fits = count >= content.min && (content.max === null || count <= content.max);'
          ),
          errors: [
            { messageId: 'copy' },
            { messageId: 'copy' },
            { messageId: 'copy' },
            { messageId: 'copy' },
          ],
        },
        {
          // HtmlPlugin.ts childrenMatchParentContent
          ...ts(
            'const content = state.schema.element(parentType)?.content;\nconst fits = !content || children.length < content.min || (content.max !== null && children.length > content.max);'
          ),
          errors: [
            { messageId: 'copy' },
            { messageId: 'copy' },
            { messageId: 'copy' },
          ],
        },
        {
          ...ts('if (editor.read.schema.element(type).content.min > 1) {}'),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts("const max = state.schema.element(type)!['content'].max;"),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts(
            'const { content } = state.schema.element(type) ?? {};\nif (content?.prefix) {}'
          ),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts(
            'const spec = state.schema.element(type);\nif (spec?.content.prefix) {}'
          ),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts(
            'const { min, max } = getEditorSchema(editor).element(type)?.content ?? {};'
          ),
          errors: [{ messageId: 'copy' }, { messageId: 'copy' }],
        },
        {
          ...ts(
            'const s = state.schema;\nconst min = s.element(type)?.content.min;'
          ),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts(
            'const { schema: rules } = editor.read;\nconst max = rules.element(type)?.content?.max;'
          ),
          errors: [{ messageId: 'copy' }],
        },
      ],
      valid: [
        // markdownMappings.ts classifies a node by allowsText and places nothing
        ts(
          'const element = state.schema.element(type);\nconst text = element.content?.allowsText;'
        ),
        ts('const roots = state.schema.element(type)?.contentRoots;'),
        ts('for (const [type, spec] of entries) {\n  use(type, spec);\n}'),
        ts(
          'const fits = state.schema.allowsElementType(parent.type, child.type);'
        ),
        ts(
          'const content = state.schema.element(type)?.content;\nfunction limit(content) {\n  return content.max;\n}'
        ),
        ts(
          'const spec = registry.element(type);\nconst min = spec.content.min;'
        ),
      ],
    }
  );

  tester.run(
    'no-structural-mark-copy',
    plugin.rules['no-structural-mark-copy'],
    {
      invalid: [
        {
          // proposed.ts's join target
          ...ts("if (hasMark(child, 'join') && target) {}"),
          errors: [{ messageId: 'copy' }],
        },
        {
          // record-completion.ts's lifted unwraps
          ...ts(
            "const lifted = readAuthoredMarks(node).filter((mark) => mark.kind === 'unwrap');"
          ),
          errors: [{ messageId: 'copy' }],
        },
        {
          ...ts("switch (mark.kind) {\n  case 'split':\n  case 'wrap':\n}"),
          errors: [{ messageId: 'copy' }, { messageId: 'copy' }],
        },
        {
          ...ts('if (mark.kind === `join`) {}'),
          errors: [{ messageId: 'copy' }],
        },
      ],
      valid: [
        ts("type Kind = 'join' | 'split';"),
        ts("const ownMark = (node: Node, kind: 'delete' | 'join') => node;"),
        ts("if (mark.kind === 'delete') {}"),
        ts("const label = 'joined';"),
      ],
    }
  );

  tester.run('no-source-text-test', plugin.rules['no-source-text-test'], {
    invalid: [
      {
        // packages/test/test/proof/scenario.test.ts
        ...ts(
          "const sourcePath = fileURLToPath(new URL('../../src/playwright/harness-assertions.ts', import.meta.url));\nconst source = readFileSync(sourcePath, 'utf-8');"
        ),
        errors: [{ messageId: 'sourceText' }],
      },
      {
        // 979c00b350
        code: "const source = readFileSync(new URL(`./${itemName}.tsx`, import.meta.url), 'utf-8');",
        errors: [{ messageId: 'sourceText' }],
        filename: 'apps/www/src/registry/ui/turn-into-toolbar-button.spec.ts',
      },
      {
        ...ts(
          "let file = fileURLToPath(new URL('../../src/table.ts', import.meta.url));\nif (useFixture) file = fixturePath;\nconst source = readFileSync(file, 'utf-8');"
        ),
        errors: [{ messageId: 'sourceText' }],
      },
      {
        ...ts(
          "let file = fileURLToPath(new URL('../../src/table.ts', import.meta.url));\nfile = file;\nconst source = readFileSync(file, 'utf-8');"
        ),
        errors: [{ messageId: 'sourceText' }],
      },
      {
        ...ts(
          "const base = '../../src';\nlet file = base + '/a.json';\nif (useCode) file = base + '/b.ts';\nreadFileSync(file);"
        ),
        errors: [{ messageId: 'sourceText' }],
      },
      {
        ...ts(
          "let file = '../../src/';\nfile += 'table.ts';\nreadFileSync(file);"
        ),
        errors: [{ messageId: 'sourceText' }],
      },
    ],
    valid: [
      ts(
        "const fixture = readFileSync(new URL('./fixtures/table.json', import.meta.url), 'utf-8');"
      ),
      ts(
        'let file = fixtureA;\nif (useOther) file = fixtureB;\nreadFileSync(file);'
      ),
    ],
  });

  tester.run('no-as-never', plugin.rules['no-as-never'], {
    invalid: [
      {
        // 4e16eada7d
        ...ts('const owner = getEditorRuntimeOwner(editor as never);'),
        errors: [{ messageId: 'asNever' }],
      },
    ],
    valid: [ts('const owner = getEditorRuntimeOwner(editor);')],
  });

  tester.run('no-plite-jsdoc', plugin.rules['no-plite-jsdoc'], {
    invalid: [
      {
        // f5be785501
        ...plate(
          "/**\n * Plite's `BlockInsertOptions`, except `after` names one block.\n */\nexport type BlockInsertOptions = {};"
        ),
        errors: [{ line: 2, messageId: 'named' }],
      },
      {
        // 5de4d78103
        ...plate(
          'type Options = {\n  /** Without one, the editor gets a generated id, such as `plite-editor-1`. */\n  id?: string;\n};'
        ),
        errors: [{ line: 2, messageId: 'named' }],
      },
    ],
    valid: [
      plate('// The Plite bridge stays out of the declarations.\nconst a = 1;'),
    ],
  });

  tester.run('no-one-off-editor-type', plugin.rules['no-one-off-editor-type'], {
    invalid: [
      {
        // 7776224726
        ...ts(
          'export type YHistoryEditor = {\n  undoManager: Y.UndoManager;\n  redo: () => void;\n};'
        ),
        errors: [{ messageId: 'oneOff' }],
      },
    ],
    valid: [ts('export interface PlateEditor extends Editor {}')],
  });

  tester.run('no-second-name', plugin.rules['no-second-name'], {
    invalid: [
      {
        // 8e29e8e879
        ...ts(
          'export const BaseCodeBlockPlugin = baseCodeBlockPluginWithContributions;'
        ),
        errors: [{ messageId: 'alias' }],
      },
    ],
    valid: [
      ts(
        "export const BaseCodeBlockPlugin = createSlatePlugin({ key: 'code_block' });"
      ),
    ],
  });

  tester.run(
    'no-relative-plite-source',
    plugin.rules['no-relative-plite-source'],
    {
      invalid: [
        {
          // e0c1500b95
          ...ts(
            "import { DecorationContext } from '../../../../../../packages/plitejs/src/react/decoration-context';"
          ),
          errors: [{ messageId: 'relative' }],
        },
      ],
      valid: [ts("import { history } from 'plitejs/history';")],
    }
  );

  tester.run('no-branded-value', plugin.rules['no-branded-value'], {
    invalid: [
      {
        ...plite(
          '<style href="plite-element-placement" precedence="plite" />;'
        ),
        errors: [{ messageId: 'text' }, { messageId: 'text' }],
      },
      {
        ...plite('element.__pliteBrowserHandle = handle;'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plate(
          'const ms = Number(process.env.PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS);'
        ),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plate('handle.insertData({ pliteFragment: fragment });'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plite('export const PliteVoidShell = () => null;'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plite('const Shell = memo(function PliteShell() { return null; });'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plite("const key = Symbol.for('plitejs.x');"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plite("const scope = '@plite/metadata';"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plate(
          "const id = nextRelationshipId(relationships, 'rIdPlateComments');"
        ),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plate("const kind = 'plate-comments';"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plate('const name = `plate_${id}`;'),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plite("throw new DOMResolutionError('plitejs/dom/path');"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plite("const root = options.rootName ?? 'plitejs';"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plite("throw new Error('Plate plugin is missing');"),
        errors: [{ messageId: 'text' }],
      },
      {
        ...plite('function PlateInner() { return null; }'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plate('class Store { pliteRoot = null; }'),
        errors: [{ messageId: 'name' }],
      },
      {
        ...plate('const view = <p>Rendered by Plite</p>;'),
        errors: [{ messageId: 'text' }],
      },
    ],
    valid: [
      plate("const name = 'platejs';"),
      plate("import { x } from 'plitejs/react';"),
      plate("export * from 'plitejs';"),
      plate("type Editor = import('plitejs').Editor;"),
      plate("const item = '@plate/ai';"),
      plate("const word = 'template';"),
      plate("const href = 'https://platejs.org';"),
      plite('function usePliteRuntime() {}'),
      plite('type T = { pliteNode: Node };'),
      plite('const { pliteFragment } = data;'),
      plite('class Store { declare pliteRoot: Node; }'),
      plate('function PlateInner() { return null; }'),
      plate('export const PlateContent = () => null;'),
      plate('throw new Error(\'Plate plugin "x" failed\');'),
      plate("throw new Error('Render the editor inside Plate.');"),
      plate('const view = <p>Made with Plate</p>;'),
    ],
  });

  tester.run('exception-format', plugin.rules['exception-format'], {
    invalid: [
      {
        ...ts(
          '// oxlint-disable-next-line plate/no-as-never -- legacy cast\nf(x as never);'
        ),
        errors: [{ messageId: 'format' }],
      },
      {
        ...ts(`${exception('2026-02-30')}\nf(x as never);`),
        errors: [{ messageId: 'format' }],
      },
      {
        ...ts(`${exception('2020-01-01')}\nf(x as never);`),
        errors: [{ messageId: 'expired' }],
      },
      {
        ...ts(`${exception(inDays(400))}\nf(x as never);`),
        errors: [{ messageId: 'tooLong' }],
      },
    ],
    valid: [
      ts(`${exception(inDays(30))}\nf(x as never);`),
      ts('// oxlint-disable-next-line no-console\nconsole.info(1);'),
    ],
  });

  tester.run('no-strict-dom-lookup', plugin.rules['no-strict-dom-lookup'], {
    invalid: [
      {
        // 979c00b350, TablePlugin.tsx; 888f9ccaed, browser-handle.ts
        ...plate('const root = editor.api.dom.findDocumentOrShadowRoot();'),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite('const { findKey } = DOMEditor;'),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite("DOMEditor['assertPath'](editor, node);"),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite(
          'const api = { resolve: (node) => DOMEditor.assertDOMNode(editor, node) };'
        ),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite(
          "const assertDOMNode = 'resolve';\nconst api = { [assertDOMNode]: (node) => DOMEditor.assertDOMNode(editor, node) };"
        ),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite('DOMEditor[`assertPath`](editor, node);'),
        errors: [{ messageId: 'strict' }],
      },
      {
        ...plite('assertDOMNode(editor, node);'),
        errors: [{ messageId: 'strict' }],
      },
    ],
    valid: [
      plite(
        'const api = { assertDOMNode: (node) => DOMEditor.assertDOMNode(editor, node) };'
      ),
    ],
  });

  tester.run(
    'baseline identity',
    withBaseline('no-as-never', noAsNever, {
      'plate/no-as-never': { 'tooling/oxlint/case.ts': ['g(y as never);'] },
    }),
    {
      invalid: [
        {
          ...ts('f(x as never);\ng(y as never);'),
          errors: [{ line: 1, messageId: 'asNever' }],
        },
        {
          // The excepted line must not consume the listed one, so the wrapper
          // forwards it for oxlint to suppress. RuleTester names the rule
          // `rule-to-test/...`, so it cannot apply the plate/ directive itself.
          ...ts(`${exception(inDays(30))}\nf(x as never);\ng(y as never);`),
          errors: [{ line: 2, messageId: 'asNever' }],
        },
        {
          ...ts('h(z as never);'),
          errors: [{ line: 1, messageId: 'asNever' }],
        },
      ],
      valid: [ts('g(y as never);')],
    }
  );
});
