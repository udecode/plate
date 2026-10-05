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
    ],
    valid: [
      ts(
        "const fixture = readFileSync(new URL('./fixtures/table.json', import.meta.url), 'utf-8');"
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
