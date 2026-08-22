import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  assertPliteBrowserFirstPartyParityContracts,
  PLITE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY,
  PLITE_BROWSER_FIRST_PARTY_PARITY_FAMILIES,
} from '../../src/core';
import {
  browserStep,
  classifyScenarioTransportClaim,
  createScenarioReductionCandidates,
  createScenarioReplay,
  decodeScenarioReplay,
  createPliteBrowserCompositionGauntlet,
  createPliteBrowserDestructiveEditingGauntlet,
  createPliteBrowserFeatureContractRegistry,
  createPliteBrowserInlineCutTypingGauntlet,
  createPliteBrowserInternalControlGauntlet,
  createPliteBrowserMixedEditingConformanceGauntlet,
  createPliteBrowserSemanticEditingConformanceGauntlet,
  createPliteBrowserShellActivationGauntlet,
  createPliteBrowserToolbarMarkClickTypingGauntlet,
  createPliteBrowserWarmLoopSteps,
  createPliteBrowserWarmToolbarArrowGauntlet,
  definePliteBrowserFeatureContract,
  matchesPliteBrowserKernelTrace,
  normalizeScenarioMetadata,
  type EditorSnapshot,
  type PliteBrowserEditorHarness,
  type PliteBrowserKernelTraceEntry,
  type PliteBrowserScenarioStep,
  serializeScenarioStepForReplay,
  summarizeScenarioReductionCandidate,
} from '../../src/playwright';
import { createEditorHarnessScenario } from '../../src/playwright/harness-scenario';

describe('scenario helpers', () => {
  test('creates prefix, suffix, and single-step reduction candidates', () => {
    const steps: PliteBrowserScenarioStep[] = [
      { kind: 'focus', label: 'focus' },
      {
        kind: 'select',
        label: 'select',
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      },
      { kind: 'type', label: 'type', text: 'A' },
    ];

    const candidates = createScenarioReductionCandidates(steps);

    expect(candidates.map((candidate) => candidate.label)).toEqual([
      'prefix:2',
      'prefix:1',
      'suffix:1',
      'suffix:2',
      'without:0',
      'without:1',
      'without:2',
    ]);
    expect(candidates.map((candidate) => candidate.steps.length)).toEqual([
      2, 1, 2, 1, 2, 2, 2,
    ]);
    expect(candidates[0].removedRange).toEqual({ end: 3, start: 2 });
    expect(candidates[2].removedRange).toEqual({ end: 1, start: 0 });
    expect(candidates[4].removedRange).toEqual({ end: 1, start: 0 });
  });

  test('does not return empty scenario candidates', () => {
    const steps: PliteBrowserScenarioStep[] = [
      { kind: 'snapshot', label: 'only-step' },
    ];

    expect(createScenarioReductionCandidates(steps)).toEqual([]);
  });

  test('registers first-party feature browser contract rows', () => {
    const registry = createPliteBrowserFeatureContractRegistry([
      definePliteBrowserFeatureContract({
        feature: 'media',
        rows: [
          {
            assertions: [
              'model and DOM selections enter and leave block voids',
              'visible void content has no hidden-anchor layout gap',
            ],
            family: 'block-void-navigation',
            routes: ['images', 'embeds'],
          },
        ],
      }),
      definePliteBrowserFeatureContract({
        feature: 'table',
        rows: [
          {
            assertions: [
              'table cell boundary arrows land at offset 0',
              'model and DOM selection agree',
            ],
            family: 'table-cell-boundary-navigation',
            routes: ['tables'],
          },
        ],
      }),
    ]);

    expect(registry.rows.map((row) => [row.feature, row.family])).toEqual([
      ['media', 'block-void-navigation'],
      ['table', 'table-cell-boundary-navigation'],
    ]);
    expect(registry.rowByFamily.get('block-void-navigation')).toMatchObject({
      feature: 'media',
      routes: ['images', 'embeds'],
    });
    expect(() =>
      createPliteBrowserFeatureContractRegistry([
        definePliteBrowserFeatureContract({
          feature: 'first',
          rows: [
            {
              assertions: ['one'],
              family: 'duplicate-family',
              routes: ['richtext'],
            },
          ],
        }),
        definePliteBrowserFeatureContract({
          feature: 'second',
          rows: [
            {
              assertions: ['two'],
              family: 'duplicate-family',
              routes: ['plaintext'],
            },
          ],
        }),
      ])
    ).toThrow(/registered more than once/);
  });

  test('locks the first-party parity slice into a fast contract guard', () => {
    const result = assertPliteBrowserFirstPartyParityContracts();
    const parityFamilies = PLITE_BROWSER_FIRST_PARTY_PARITY_FAMILIES.map(
      (family) => family.family
    );

    expect(result.parityFamilies).toEqual(parityFamilies);
    expect(parityFamilies).toEqual([
      'inline-void-boundary-navigation',
      'block-void-navigation',
      'external-decoration-refresh',
      'mouse-selection-toolbar',
      'table-cell-boundary-navigation',
    ]);
    expect(
      PLITE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY.rows.map((row) => [
        row.feature,
        row.family,
        row.routes,
      ])
    ).toEqual(
      expect.arrayContaining([
        ['mentions', 'inline-void-boundary-navigation', ['mentions']],
        ['media', 'block-void-navigation', ['images', 'embeds']],
        [
          'external-decorations',
          'external-decoration-refresh',
          ['search-highlighting'],
        ],
        ['selection-ui', 'mouse-selection-toolbar', ['hovering-toolbar']],
        [
          'core-editing',
          'huge-document-projected-vertical-selection',
          ['huge-document'],
        ],
        [
          'core-editing',
          'huge-document-virtualized-scroll-stability',
          ['huge-document'],
        ],
        [
          'core-editing',
          'native-beforeinput-target-range-repair',
          ['plaintext'],
        ],
        ['core-editing', 'ime-composition-formatted-boundaries', ['richtext']],
        ['core-editing', 'ime-composition-cross-block-repair', ['richtext']],
        [
          'core-editing',
          'ime-composition-decoration-refresh',
          ['decorations-async'],
        ],
        ['core-editing', 'external-clipboard-slice-context', ['paste-html']],
        ['table', 'table-cell-boundary-navigation', ['tables']],
      ])
    );
  });

  test('keeps generated stress parity out of the default check script', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../../../package.json', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    const { scripts } = packageJson;

    expect(scripts.check).not.toContain('test:stress');
    expect(scripts.check).not.toContain('test:integration-local');
    expect(scripts.check).not.toContain('check:full');
    expect(scripts['plite:browser:test']).toContain('@platejs/browser test');
    expect(scripts['plite:browser:test:proof']).toContain(
      '@platejs/browser test:proof'
    );
    expect(scripts['plite:browser:test:selection']).toContain(
      '@platejs/browser test:selection'
    );
  });

  test('documents integration coverage outside the default check script', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../../../package.json', import.meta.url)
    );
    const readmePath = fileURLToPath(
      new URL('../../../../README.md', import.meta.url)
    );
    const contributingPath = fileURLToPath(
      new URL('../../../../CONTRIBUTING.md', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    const { scripts } = packageJson;
    const docs = [
      readFileSync(readmePath, 'utf-8'),
      readFileSync(contributingPath, 'utf-8'),
    ];

    expect(scripts.check).not.toContain('plite:browser:test:proof');
    expect(scripts.e2e).toContain('playwright test');
    expect(scripts['plite:browser:test:proof']).toContain(
      '@platejs/browser test:proof'
    );
    for (const doc of docs) {
      expect(doc).toContain('Plate');
    }
  });

  test('builds plite-browser before public-export Playwright integration', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../../../package.json', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    const { scripts } = packageJson;

    if (!scripts.playwright) {
      expect(scripts['plite:packages:build']).toContain('./packages/browser');
      expect(scripts['plite:browser:test:proof']).toContain(
        '@platejs/browser test:proof'
      );
      expect(scripts['plite:browser:test:selection']).toContain(
        '@platejs/browser test:selection'
      );
      return;
    }

    expect(scripts.playwright).toContain('bun --filter plite-browser build');
    expect(scripts['test:integration']).toContain('bun run playwright');
    expect(scripts['test:integration-local']).toContain('bun run playwright');
    expect(scripts['test:stress']).toContain(
      'bun --filter plite-browser build'
    );
    expect(scripts['test:stress']).toContain('playwright test');
    expect(scripts['test:stress:audit']).toContain(
      'scripts/stress/audit-artifacts.mjs'
    );
    expect(scripts['test:stress:audit']).toContain(
      'STRESS_AUDIT_EXPECTED_PER_PROJECT=24'
    );
    expect(scripts['test:stress:audit']).toContain(
      'STRESS_AUDIT_PROJECTS=chromium'
    );
    expect(scripts['test:stress:audit']).toContain(
      'STRESS_AUDIT_MAX_AGE_MINUTES=30'
    );
    expect(scripts['test:stress:audit:desktop']).toContain(
      'STRESS_AUDIT_EXPECTED_PER_PROJECT=24'
    );
    expect(scripts['test:stress:audit:desktop']).not.toContain(
      'STRESS_AUDIT_MAX_AGE_MINUTES'
    );
    const stressAuditSource = readFileSync(
      fileURLToPath(
        new URL(
          '../../../../scripts/stress/audit-artifacts.mjs',
          import.meta.url
        )
      ),
      'utf-8'
    );

    expect(stressAuditSource).toContain('expectedPerProject === null');
    expect(stressAuditSource).toContain('? 30');
    expect(stressAuditSource).toContain(': null');
    expect(stressAuditSource).toContain(
      "import { getDesktopProjects } from './desktop-projects.mjs'"
    );
    expect(stressAuditSource).toContain("getDesktopProjects().join(',')");
    expect(stressAuditSource).toContain('.slice(0, expectedPerProject)');
    expect(stressAuditSource).toContain('getBunScript(artifact.replayCommand)');
    expect(stressAuditSource).toContain(
      "getEnvAssignment(candidate.replayCommand, 'STRESS_REDUCTION')"
    );
    expect(scripts['test:stress:desktop']).toContain(
      'bun --filter plite-browser build'
    );
    expect(scripts['test:stress:desktop']).toContain(
      'scripts/stress/project-args.mjs desktop'
    );
    const stressProjectArgsSource = readFileSync(
      fileURLToPath(
        new URL('../../../../scripts/stress/project-args.mjs', import.meta.url)
      ),
      'utf-8'
    );
    const stressDesktopProjectsSource = readFileSync(
      fileURLToPath(
        new URL(
          '../../../../scripts/stress/desktop-projects.mjs',
          import.meta.url
        )
      ),
      'utf-8'
    );

    expect(stressProjectArgsSource).toContain(
      "import { getDesktopProjects } from './desktop-projects.mjs'"
    );
    expect(stressProjectArgsSource).toContain('getDesktopProjects()');
    expect(stressDesktopProjectsSource).toContain("os.type() === 'Darwin'");
    expect(scripts['test:stress:desktop']).toContain('playwright test');
    expect(scripts['test:stress:replay']).toContain(
      'bun --filter plite-browser build'
    );
    expect(scripts['test:stress:replay']).toContain('playwright test');
    expect(scripts['test:stress:replay:desktop']).toContain(
      'bun --filter plite-browser build'
    );
    expect(scripts['test:stress:replay:desktop']).toContain(
      'scripts/stress/project-args.mjs desktop'
    );
    expect(scripts['test:stress:replay:firefox']).toContain(
      '--project=firefox'
    );
    expect(scripts['test:stress:replay:webkit']).toContain('--project=webkit');
  });

  test('keeps stress artifacts reducible before a scenario succeeds', () => {
    const sourcePath = fileURLToPath(
      new URL('../../../../playwright/stress/stress-utils.ts', import.meta.url)
    );
    const readmePath = fileURLToPath(
      new URL('../../README.md', import.meta.url)
    );
    const readme = readFileSync(readmePath, 'utf-8');

    if (!existsSync(sourcePath)) {
      expect(readme).toContain('@platejs/browser');
      return;
    }

    const source = readFileSync(sourcePath, 'utf-8');

    expect(source).toContain('createScenarioReductionCandidates');
    expect(source).toContain('summarizeScenarioReductionCandidate');
    expect(source).toContain('reductionCandidates ??');
    expect(source).toContain(
      'reductionCandidates: artifactReductionCandidates'
    );
    expect(source).toContain('STRESS_REDUCTION=');
    expect(source).toContain('artifactStepsToScenarioSteps = (');
    expect(source).toContain('reductionLabel');
    expect(readme).toContain('STRESS_REDUCTION=<label>');
    expect(readme).toContain('.reduction-<label>.result.json');
  });

  test('keeps generic HTML assertion exact instead of substring-only', () => {
    const sourcePath = fileURLToPath(
      new URL('../../src/playwright/harness-assertions.ts', import.meta.url)
    );
    const source = readFileSync(sourcePath, 'utf-8');

    expect(source).toContain('html: async (');
    expect(source).toContain('expectedHtml: string');
    expect(source).toContain(
      'await getHarness().assert.htmlEquals(expectedHtml'
    );
    expect(source).toContain('htmlContains: async (expectedFragment: string)');
  });

  test('exposes blur-caret proof as a first-party Playwright assertion', () => {
    const sourcePath = fileURLToPath(
      new URL('../../src/playwright/harness-assertions.ts', import.meta.url)
    );
    const caretSourcePath = fileURLToPath(
      new URL('../../src/playwright/caret-visibility.ts', import.meta.url)
    );
    const typeSourcePath = fileURLToPath(
      new URL('../../src/playwright/types.ts', import.meta.url)
    );
    const readmePath = fileURLToPath(
      new URL('../../README.md', import.meta.url)
    );
    const source = readFileSync(sourcePath, 'utf-8');
    const caretSource = readFileSync(caretSourcePath, 'utf-8');
    const typeSource = readFileSync(typeSourcePath, 'utf-8');
    const readme = readFileSync(readmePath, 'utf-8');

    expect(typeSource).toContain('noVisibleCaretInRoot: () => Promise<void>');
    expect(caretSource).toContain('assertNoVisibleCaretInRoot');
    expect(source).toContain('await assertNoVisibleCaretInRoot(root)');
    expect(readme).toContain('editor.assert.noVisibleCaretInRoot()');
  });

  test('summarizes canonical reduction candidates as replayable data', () => {
    const steps: PliteBrowserScenarioStep[] = [
      browserStep.fill({
        label: 'fill-control',
        target: '#control',
        value: 'A',
      }),
      { kind: 'type', label: 'type-step', text: 'A' },
    ];
    const candidate = createScenarioReductionCandidates(steps)[0];

    expect(summarizeScenarioReductionCandidate(candidate)).toEqual({
      kind: 'prefix',
      label: 'prefix:1',
      removedStepLabels: ['type-step'],
      removedStepSummaries: ['type-step: type "A" len=1'],
      removedRange: { end: 2, start: 1 },
      replay: {
        replayable: true,
        steps: [
          {
            kind: 'fillControl',
            label: 'fill-control',
            replayable: true,
            summary: 'fill-control: fillControl',
            value: {
              kind: 'fillControl',
              label: 'fill-control',
              selector: '#control',
              value: 'A',
            },
          },
        ],
      },
      stepLabels: ['fill-control'],
      stepSummaries: ['fill-control: fillControl'],
    });
  });

  test('serializes replayable scenario steps with action payloads', () => {
    const step: PliteBrowserScenarioStep = {
      iteration: 2,
      kind: 'select',
      label: 'select-word',
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 5 },
      },
      warmLoop: 'warm-toolbar',
    };

    expect(serializeScenarioStepForReplay(step, 0)).toEqual({
      iteration: 2,
      kind: 'select',
      label: 'select-word',
      replayable: true,
      summary: 'select-word: select 0.0:1 -> 0.0:5',
      value: {
        iteration: 2,
        kind: 'select',
        label: 'select-word',
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 5 },
        },
        warmLoop: 'warm-toolbar',
      },
      warmLoop: 'warm-toolbar',
    });
  });

  test('serializes DOM text mutation steps for replay', () => {
    const step: PliteBrowserScenarioStep = {
      data: 'imported',
      inputType: 'insertText',
      kind: 'mutateTextDOM',
      label: 'import-dom-text',
      path: [0, 0],
      selectionOffset: 13,
      text: 'This imported',
    };

    expect(serializeScenarioStepForReplay(step, 0)).toEqual({
      kind: 'mutateTextDOM',
      label: 'import-dom-text',
      replayable: true,
      summary: 'import-dom-text: mutateTextDOM 0.0 "This imported" len=13',
      value: {
        data: 'imported',
        inputType: 'insertText',
        kind: 'mutateTextDOM',
        label: 'import-dom-text',
        path: [0, 0],
        selectionOffset: 13,
        text: 'This imported',
      },
    });
  });

  test('serializes rendered DOM shape assertions for replay', () => {
    const step: PliteBrowserScenarioStep = {
      kind: 'assertRenderedDOMShape',
      label: 'assert-first-block-dom-shape',
      shape: {
        blockIndex: 0,
        domSelectionTarget: {
          anchorPath: [0, 0],
          isCollapsed: true,
        },
        lineBoxCount: { max: 1 },
        noUnexpectedZeroWidthBreaks: true,
        textContent: 'alpha',
        zeroWidthBreakCount: 0,
      },
    };

    expect(serializeScenarioStepForReplay(step, 0)).toEqual({
      kind: 'assertRenderedDOMShape',
      label: 'assert-first-block-dom-shape',
      replayable: true,
      summary: 'assert-first-block-dom-shape: assertRenderedDOMShape',
      value: {
        kind: 'assertRenderedDOMShape',
        label: 'assert-first-block-dom-shape',
        shape: {
          blockIndex: 0,
          domSelectionTarget: {
            anchorPath: [0, 0],
            isCollapsed: true,
          },
          lineBoxCount: { max: 1 },
          noUnexpectedZeroWidthBreaks: true,
          textContent: 'alpha',
          zeroWidthBreakCount: 0,
        },
      },
    });
  });

  test('serializes replayable browser stress assertion steps', () => {
    const steps: PliteBrowserScenarioStep[] = [
      {
        kind: 'dragTextSelection',
        label: 'drag-toolbar-target',
        selector: 'span[data-plite-string="true"]',
        steps: 12,
      },
      {
        kind: 'assertLocatorCount',
        label: 'assert-highlights',
        min: 1,
        selector: '[data-cy="search-highlighted"]',
      },
      {
        kind: 'assertLocatorCss',
        label: 'assert-toolbar-visible',
        property: 'opacity',
        selector: '[data-test-id="menu"]',
        value: '1',
      },
      {
        afterSelector: 'p',
        beforeSelector: 'input[type="text"]',
        kind: 'assertLocatorVerticalGap',
        label: 'assert-embed-gap',
        max: 24,
        min: 12,
      },
      {
        innerSelector: '[contenteditable="false"]',
        kind: 'assertLocatorVerticalOffset',
        label: 'assert-image-offset',
        max: 1,
        min: 0,
        selector: '[data-plite-path="1"]',
      },
      {
        kind: 'assertModelSelectionExpanded',
        label: 'assert-model-selection-expanded',
      },
      {
        contains: 'issues:2',
        kind: 'assertLocatorText',
        label: 'assert-lint-issue-count',
        selector: '#linting-count',
      },
      {
        kind: 'clickSelector',
        label: 'click-linter-button',
        selector: 'button:has-text("Run linter")',
      },
      {
        kind: 'captureNodeKey',
        label: 'capture-image-node-key',
        name: 'image',
        path: [1],
      },
      {
        change: { changes: {}, version: 2 },
        kind: 'applyChange',
        label: 'remote-remove-image',
        tag: 'remote-import',
      },
      {
        kind: 'assertCapturedNodeKeyPath',
        label: 'assert-image-node-key-null',
        name: 'image',
        path: null,
      },
      {
        kind: 'assertLastCommitTags',
        label: 'assert-remote-tags',
        tags: ['remote-import'],
      },
      {
        kind: 'assertWindowSelectionText',
        label: 'assert-native-selection',
        notEmpty: true,
      },
      {
        expectation: {
          domSelection: {
            anchorNodeText: 'alpha',
            anchorOffset: 0,
            focusNodeText: 'alpha',
            focusOffset: 5,
          },
          noDoubleSelectionHighlight: true,
          selectedText: 'alpha',
          selection: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 5 },
          },
        },
        kind: 'assertSelectionContract',
        label: 'assert-selection-contract',
      },
      {
        budget: {
          byKind: {
            editable: { max: 0 },
            element: 0,
          },
          total: { max: 2 },
        },
        kind: 'assertRenderBudget',
        label: 'assert-render-budget',
      },
      {
        kind: 'resetRenderProfiler',
        label: 'reset-render-profiler',
      },
    ];

    expect(createScenarioReplay(steps).replayable).toBe(true);
    expect(createScenarioReplay(steps).steps.map((step) => step.kind)).toEqual([
      'dragTextSelection',
      'assertLocatorCount',
      'assertLocatorCss',
      'assertLocatorVerticalGap',
      'assertLocatorVerticalOffset',
      'assertModelSelectionExpanded',
      'assertLocatorText',
      'clickSelector',
      'captureNodeKey',
      'applyChange',
      'assertCapturedNodeKeyPath',
      'assertLastCommitTags',
      'assertWindowSelectionText',
      'assertSelectionContract',
      'assertRenderBudget',
      'resetRenderProfiler',
    ]);
  });

  test('rejects closures hidden inside canonical scenario data', () => {
    expect(() =>
      createScenarioReplay([
        {
          change: { run: () => {} },
          kind: 'applyChange',
          label: 'not-serializable',
        },
      ])
    ).toThrow(/editor\.scenario\.runImperative/);
  });

  test('rejects undefined payload data instead of changing replay indexes', () => {
    expect(() =>
      createScenarioReplay([
        {
          kind: 'applyValueChange',
          value: { children: [undefined, 'x'] },
        },
      ])
    ).toThrow(/editor\.scenario\.runImperative/);

    expect(
      createScenarioReplay([{ kind: 'settle', timeoutMs: undefined }])
    ).toMatchObject({
      steps: [{ value: { kind: 'settle' } }],
    });
  });

  test('rejects sparse payload arrays instead of serializing holes as null', () => {
    const children = new Array<unknown>(2);
    children[1] = 'x';

    expect(() =>
      createScenarioReplay([
        {
          kind: 'applyValueChange',
          value: { children },
        },
      ])
    ).toThrow(/editor\.scenario\.runImperative/);
  });

  test('round-trips shell activation through canonical JSON replay', () => {
    const replay = createScenarioReplay([
      {
        buttonName: 'Open editor',
        expectedSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        kind: 'activateShell',
      },
    ]);

    expect(decodeScenarioReplay(JSON.parse(JSON.stringify(replay)))).toEqual(
      replay
    );
  });

  test('rejects non-JSON shell button matchers', () => {
    expect(() =>
      createScenarioReplay([
        {
          buttonName: /Open editor/u as unknown as string,
          expectedSelection: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
          kind: 'activateShell',
        },
      ])
    ).toThrow(/editor\.scenario\.runImperative/);
  });

  test('rejects malformed and unknown imported scenario steps', () => {
    expect(() =>
      decodeScenarioReplay({
        replayable: true,
        steps: [
          {
            kind: 'unknown',
            label: '0:unknown',
            replayable: true,
            summary: '0:unknown: unknown',
            value: { kind: 'unknown' },
          },
        ],
      })
    ).toThrow(/not a supported scenario step/);

    const replay = createScenarioReplay([
      {
        buttonName: 'Open editor',
        expectedSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        kind: 'activateShell',
      },
    ]);
    const imported = JSON.parse(JSON.stringify(replay)) as {
      steps: Array<{ value: Record<string, unknown> }>;
    };

    imported.steps[0].value.buttonName = { source: 'Open editor' };

    expect(() => decodeScenarioReplay(imported)).toThrow(
      /buttonName is invalid/
    );
  });

  test('rejects declarative assertion steps that cannot prove anything', () => {
    const noOpSteps = [
      {
        kind: 'assertLocatorCount',
        selector: '[data-editor]',
      },
      {
        count: 1,
        kind: 'assertLocatorCount',
        min: 100,
        selector: '[data-editor]',
      },
      {
        kind: 'assertLocatorCss',
        property: 'opacity',
        selector: '[data-toolbar]',
      },
      {
        kind: 'assertLocatorText',
        selector: '[data-editor]',
      },
      {
        kind: 'assertLocatorVerticalGap',
        afterSelector: '[data-after]',
        beforeSelector: '[data-before]',
      },
      {
        innerSelector: '[data-inner]',
        kind: 'assertLocatorVerticalOffset',
        selector: '[data-outer]',
      },
      { kind: 'assertWindowSelectionText', notEmpty: false },
      { budget: {}, kind: 'assertRenderBudget' },
      { budget: { total: {} }, kind: 'assertRenderBudget' },
      { expectation: {}, kind: 'assertSelectionContract' },
      {
        expectation: { noDoubleSelectionHighlight: false },
        kind: 'assertSelectionContract',
      },
      { kind: 'assertKernelTrace', trace: {} },
      { kind: 'assertKernelTrace', trace: { madeUp: true } },
      { kind: 'assertRenderedDOMShape', shape: {} },
      { kind: 'assertRenderedDOMShape', shape: { blockIndex: 1 } },
      {
        kind: 'assertRenderedDOMShape',
        shape: { noUnexpectedZeroWidthBreaks: false },
      },
      { kind: 'assertRenderedDOMShape', shape: { madeUp: true } },
      { kind: 'assertSelectionLocation', location: {} },
      { contains: '', kind: 'assertLocatorText', selector: '[data-editor]' },
      { contains: '', kind: 'assertWindowSelectionText' },
      { kind: 'assertModelText', text: '' },
      { kind: 'assertText', text: '' },
      { kind: 'assertLastCommitIncludesTags', tags: [] },
    ];

    for (const step of noOpSteps) {
      expect(() =>
        decodeScenarioReplay({
          replayable: true,
          steps: [
            {
              kind: step.kind,
              label: `0:${step.kind}`,
              replayable: true,
              summary: `0:${step.kind}: ${step.kind}`,
              value: step,
            },
          ],
        })
      ).toThrow();
    }
  });

  test('rejects a render-count budget that combines exact and range assertions', () => {
    expect(() =>
      createScenarioReplay([
        {
          budget: { total: { exact: 1, min: 0 } },
          kind: 'assertRenderBudget',
        } as PliteBrowserScenarioStep,
      ])
    ).toThrow();
  });

  test('rejects negative or fractional render-count budgets', () => {
    const invalidBudgets = [
      -1,
      0.5,
      { exact: -1 },
      { exact: 0.5 },
      { max: -1 },
      { max: 0.5 },
      { min: -1 },
      { min: 0.5 },
    ];

    for (const total of invalidBudgets) {
      expect(() =>
        createScenarioReplay([
          {
            budget: { total },
            kind: 'assertRenderBudget',
          },
        ])
      ).toThrow();
    }
  });

  test('accepts scalar, exact, and bounded render-count budgets', () => {
    const validBudgets = [
      0,
      { exact: 0 },
      { max: 2 },
      { min: 0 },
      { max: 2, min: 0 },
    ];

    for (const total of validBudgets) {
      expect(() =>
        createScenarioReplay([
          {
            budget: { total },
            kind: 'assertRenderBudget',
          },
        ])
      ).not.toThrow();
    }
  });

  test('rejects negative or fractional rendered line-box counts', () => {
    const invalidCounts = [
      -1,
      0.5,
      { max: -1 },
      { max: 0.5 },
      { min: -1 },
      { min: 0.5 },
    ];

    for (const lineBoxCount of invalidCounts) {
      expect(() =>
        createScenarioReplay([
          {
            kind: 'assertRenderedDOMShape',
            shape: { lineBoxCount },
          },
        ])
      ).toThrow();
    }
  });

  test('rejects count ranges whose minimum exceeds their maximum', () => {
    const invalidSteps = [
      {
        budget: { total: { max: 1, min: 2 } },
        kind: 'assertRenderBudget',
      },
      {
        kind: 'assertRenderedDOMShape',
        shape: { lineBoxCount: { max: 1, min: 2 } },
      },
      {
        kind: 'assertLocatorCount',
        max: 1,
        min: 2,
        selector: '[data-editor]',
      },
    ];

    for (const step of invalidSteps) {
      expect(() =>
        createScenarioReplay([step as PliteBrowserScenarioStep])
      ).toThrow();
    }
  });

  test('rejects invalid discrete offsets across replay steps', () => {
    const selection = (offset: unknown) => ({
      anchor: { offset, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    });
    const invalidSteps = [
      { kind: 'assertDOMCaret', offset: -1, text: 'a' },
      { kind: 'assertDOMCaret', offset: 0.5, text: 'a' },
      { kind: 'clickTextOffset', offset: -1, path: [0, 0] },
      { kind: 'doubleClickTextOffset', offset: 0.5, path: [0, 0] },
      {
        kind: 'mutateTextDOM',
        path: [0, 0],
        selectionOffset: -1,
        text: 'a',
      },
      { kind: 'select', selection: selection(0.5) },
      { kind: 'selectDOM', selection: selection(-1) },
      {
        kind: 'assertSelectionLocation',
        location: { anchorOffset: 0.5 },
      },
      {
        caretAfterType: { offset: -1, text: 'a' },
        caretAfterUndo: { offset: 0, text: 'a' },
        expectedModelTextAfterType: 'a',
        expectedModelTextAfterUndo: 'a',
        kind: 'typeThenUndo',
        text: 'a',
      },
    ];

    for (const step of invalidSteps) {
      expect(() =>
        createScenarioReplay([step as PliteBrowserScenarioStep])
      ).toThrow();
    }
  });

  test('rejects invalid inclusive offset ranges', () => {
    const invalidRanges = [
      [-1, 0],
      [0, 0.5],
      [2, 1],
    ];

    for (const offset of invalidRanges) {
      const invalidSteps = [
        {
          kind: 'assertSelection',
          selection: {
            anchor: { offset, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
            kind: 'text',
          },
        },
        {
          kind: 'assertDOMSelection',
          selection: {
            anchorNodeText: 'a',
            anchorOffset: offset,
            focusNodeText: 'a',
            focusOffset: 0,
          },
        },
      ];

      for (const step of invalidSteps) {
        expect(() =>
          createScenarioReplay([step as PliteBrowserScenarioStep])
        ).toThrow();
      }
    }
  });

  test('orders geometric ranges without rejecting finite fractions', () => {
    const reversedGeometry = [
      {
        afterSelector: '[data-after]',
        beforeSelector: '[data-before]',
        kind: 'assertLocatorVerticalGap',
        max: 1,
        min: 2,
      },
      {
        innerSelector: '[data-inner]',
        kind: 'assertLocatorVerticalOffset',
        max: -1,
        min: 0,
        selector: '[data-outer]',
      },
    ];
    const validGeometry = [
      {
        afterSelector: '[data-after]',
        beforeSelector: '[data-before]',
        kind: 'assertLocatorVerticalGap',
        max: 0,
        min: -0.5,
      },
      {
        innerSelector: '[data-inner]',
        kind: 'assertLocatorVerticalOffset',
        max: 1.5,
        min: 0.25,
        selector: '[data-outer]',
      },
    ];

    for (const step of reversedGeometry) {
      expect(() =>
        createScenarioReplay([step as PliteBrowserScenarioStep])
      ).toThrow();
    }
    for (const step of validGeometry) {
      expect(() =>
        createScenarioReplay([step as PliteBrowserScenarioStep])
      ).not.toThrow();
    }
  });

  test('requires nonnegative finite settle timeouts', () => {
    expect(() =>
      createScenarioReplay([{ kind: 'settle', timeoutMs: -1 }])
    ).toThrow();

    for (const timeoutMs of [0, 0.5]) {
      expect(() =>
        createScenarioReplay([{ kind: 'settle', timeoutMs }])
      ).not.toThrow();
    }
  });

  test('fails closed when an unsupported step reaches scenario execution', async () => {
    const scenario = createEditorHarnessScenario({
      getHarness: () => ({}) as PliteBrowserEditorHarness,
      page: {} as never,
      root: {} as never,
      surface: {} as never,
    });

    await expect(
      scenario.run(
        'unsupported-step',
        [{ kind: 'unknown' } as unknown as PliteBrowserScenarioStep],
        { runtimeErrors: false }
      )
    ).rejects.toThrow(/not a supported scenario step/);
  });

  test('uses semantic undo for mobile scenarios', async () => {
    const actions: string[] = [];
    const snapshot = { text: 'after undo' } as EditorSnapshot;
    const harness: Pick<PliteBrowserEditorHarness, 'press' | 'trace' | 'undo'> =
      {
        press: async (key) => {
          actions.push(key);
        },
        trace: {
          snapshot: async (label, stepIndex = null) => ({
            label,
            snapshot,
            stepIndex,
          }),
        },
        undo: async () => {
          actions.push('undo');
        },
      };
    const scenario = createEditorHarnessScenario({
      getHarness: () => harness as PliteBrowserEditorHarness,
      page: {} as never,
      root: {} as never,
      surface: {} as never,
    });

    await scenario.run('mobile undo', [{ kind: 'undo' }], {
      metadata: { platform: 'mobile' },
      runtimeErrors: false,
    });

    expect(actions).toEqual(['undo']);
  });

  test('runs imperative experiments in an explicitly non-proof lane', async () => {
    const actions: string[] = [];
    const snapshot = { text: 'after type' } as EditorSnapshot;
    const harness: Pick<PliteBrowserEditorHarness, 'trace'> = {
      trace: {
        snapshot: async (label, stepIndex = null) => ({
          label,
          snapshot,
          stepIndex,
        }),
      },
    };
    const scenario = createEditorHarnessScenario({
      getHarness: () => harness as PliteBrowserEditorHarness,
      page: {} as never,
      root: {} as never,
      surface: {} as never,
    });
    const result = await scenario.runImperative(
      'native keyboard experiment',
      async ({ step }) => {
        await step('type', () => {
          actions.push('type');
        });
      }
    );

    expect(actions).toEqual(['type']);
    expect(result).toEqual({
      kind: 'imperative-scenario',
      name: 'native keyboard experiment',
      reducible: false,
      releaseGateCapable: false,
      replayable: false,
      steps: [{ label: 'type', snapshot, stepIndex: 0 }],
    });
  });

  test('creates replayable warm toolbar arrow gauntlet steps', () => {
    const replay = createScenarioReplay(
      createPliteBrowserWarmToolbarArrowGauntlet({
        domCaretAfterInsert: {
          offset: 9,
          text: 'editableW',
        },
        insertedText: 'W',
        markDOMSelection: {
          anchorNodeText: 'This is editable ',
          anchorOffset: 8,
          focusNodeText: 'This is editable ',
          focusOffset: 16,
        },
        markButtonTestId: 'mark-button-bold',
        markSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 16 },
        },
        selectedText: 'editable',
        selectionAfterArrowLeft: {
          kind: 'text',
          anchor: { path: [0, 1], offset: 7 },
          focus: { path: [0, 1], offset: 7 },
        },
        selectionAfterCollapse: {
          kind: 'text',
          anchor: { path: [0, 1], offset: 8 },
          focus: { path: [0, 1], offset: 8 },
        },
        selectionAfterInsert: {
          kind: 'text',
          anchor: { path: [0, 1], offset: 9 },
          focus: { path: [0, 1], offset: 9 },
        },
        textAfterInsert:
          'This is editableW rich text, much better than a <textarea>!',
        warmIterations: 1,
      })
    );

    expect(replay.replayable).toBe(true);
    expect(replay.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'clickTestId',
          label: 'warm-bold-on-1',
          value: expect.objectContaining({
            kind: 'clickTestId',
            testId: 'mark-button-bold',
          }),
        }),
        expect.objectContaining({
          kind: 'settle',
          label: 'warm-wait-after-bold-on-1',
          value: expect.objectContaining({
            kind: 'settle',
            timeoutMs: 25,
          }),
        }),
        expect.objectContaining({
          kind: 'assertSelectedText',
          label: 'assert-selection-expanded-after-bold-on-1',
          value: expect.objectContaining({
            kind: 'assertSelectedText',
            text: 'editable',
          }),
        }),
      ])
    );
  });

  test('creates replayable generated command-family gauntlet helpers', () => {
    const collapsed = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const selected = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const point = { path: [0, 0], offset: 2 };
    const helpers = [
      createPliteBrowserInternalControlGauntlet({
        controlSelector: '[data-testid="internal-control"]',
        controlValue: 'inner',
        followUpText: 'Z',
        outerSelection: collapsed,
        textAfterFollowUp: 'textZ',
      }),
      createPliteBrowserCompositionGauntlet({
        committedText: 'é',
        selection: collapsed,
        steps: ['e', 'é'],
        text: 'é',
        textAfterComposition: 'texté',
        transport: 'synthetic',
      }),
      createPliteBrowserShellActivationGauntlet({
        buttonName: 'Open editor',
        expectedSelection: collapsed,
      }),
      createPliteBrowserInlineCutTypingGauntlet({
        domShape: {
          afterCut: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
          },
          afterTyping: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            textContent: 'textZ',
          },
        },
        replacementText: 'Z',
        selection: selected,
        textAfterTyping: 'textZ',
      }),
      createPliteBrowserToolbarMarkClickTypingGauntlet({
        clickPoint: point,
        insertedText: 'Z',
        markButtonTestId: 'mark-button-bold',
        markSelection: selected,
        selectionAfterInsert: collapsed,
        textAfterInsert: 'textZ',
      }),
      createPliteBrowserMixedEditingConformanceGauntlet({
        deleteKey: 'Backspace',
        domShape: {
          afterDelete: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            textContent: 'text',
          },
          afterFollowUp: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            textContent: 'textZ',
          },
          afterInsert: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            textContent: 'textZ',
          },
        },
        insertedText: 'Z',
        navigationKeys: ['ArrowRight'],
        selectionAfterDelete: collapsed,
        selectionAfterFollowUp: collapsed,
        selectionAfterInsert: collapsed,
        selectionAfterNavigation: collapsed,
        startSelection: collapsed,
        textAfterDelete: 'text',
        textAfterFollowUp: 'textZ',
        textAfterInsert: 'textZ',
        toolbarButtonTestId: 'mark-button-bold',
        toolbarSelection: selected,
        toolbarSelectionAfterCommand: selected,
      }),
      createPliteBrowserSemanticEditingConformanceGauntlet({
        insertedText: 'Z',
        selectionAfterDelete: collapsed,
        selectionAfterFollowUp: collapsed,
        selectionAfterInsert: collapsed,
        startSelection: collapsed,
        textAfterDelete: 'text',
        textAfterFollowUp: 'textZ',
        textAfterInsert: 'textZ',
        toolbarButtonTestId: 'mark-button-bold',
        toolbarSelection: selected,
        toolbarSelectionAfterCommand: selected,
      }),
    ];

    for (const steps of helpers) {
      expect(createScenarioReplay(steps).replayable).toBe(true);
    }
  });

  test('creates replayable generated destructive editing gauntlet steps', () => {
    const steps = createPliteBrowserDestructiveEditingGauntlet({
      domShape: {
        afterDeleteAfterPaste: {
          blockIndex: 0,
          noUnexpectedZeroWidthBreaks: true,
          textContent: 'Past text',
        },
        afterFollowUp: {
          blockIndex: 0,
          noUnexpectedZeroWidthBreaks: true,
          textContent: 'Past! text',
        },
        afterPaste: {
          blockIndex: 0,
          noUnexpectedZeroWidthBreaks: true,
          textContent: 'Paste text',
        },
        afterWordDeleteFollowUp: {
          blockIndex: 0,
          noUnexpectedZeroWidthBreaks: true,
        },
        afterWordDeleteIterations: [
          {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
          },
          {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
          },
        ],
      },
      followUpText: '!',
      pasteSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
      pastedText: 'Paste',
      selectionAfterDeleteAfterPaste: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      selectionAfterFollowUp: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
      selectionAfterPaste: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
      tailBlockTextsAfterWordDelete: ['tail'],
      textAfterDeleteAfterPaste: 'Past text',
      textAfterFollowUp: 'Past! text',
      textAfterPaste: 'Paste text',
      wordDeleteIterations: 2,
      wordDeleteSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 4 },
        focus: { path: [0, 1], offset: 4 },
      },
    });

    expect(createScenarioReplay(steps).replayable).toBe(true);
    expect(steps.map((step) => step.label)).toEqual(
      expect.arrayContaining([
        'paste-over-selected-range',
        'assert-dom-shape-after-paste',
        'delete-after-paste-Backspace',
        'assert-dom-shape-after-delete-after-paste',
        'assert-dom-shape-after-delete-follow-up',
        'word-delete-backward-1',
        'assert-dom-shape-after-word-delete-1',
        'word-delete-backward-2',
        'assert-dom-shape-after-word-delete-2',
        'assert-tail-blocks-after-word-delete-follow-up',
        'assert-dom-shape-after-word-delete-follow-up',
      ])
    );
    expect(
      createScenarioReductionCandidates(steps).some(
        (candidate) =>
          candidate.kind === 'single-step' &&
          createScenarioReplay(candidate.steps).replayable
      )
    ).toBe(true);
  });

  test('creates generated warm loop steps with iteration labels', () => {
    const steps = createPliteBrowserWarmLoopSteps({
      createIteration: (iteration) => [
        { kind: 'focus', label: `focus-${iteration}` },
        { kind: 'type', label: `type-${iteration}`, text: `${iteration}` },
      ],
      label: 'warm-toolbar',
      iterations: 2,
    });

    expect(steps.map((step) => step.label)).toEqual([
      'focus-1',
      'type-1',
      'focus-2',
      'type-2',
    ]);
    expect(
      steps.map((step) => ({
        iteration: step.iteration,
        warmLoop: step.warmLoop,
      }))
    ).toEqual([
      { iteration: 1, warmLoop: 'warm-toolbar' },
      { iteration: 1, warmLoop: 'warm-toolbar' },
      { iteration: 2, warmLoop: 'warm-toolbar' },
      { iteration: 2, warmLoop: 'warm-toolbar' },
    ]);
  });

  test('rejects invalid generated scenario iteration counts', () => {
    const invalidCounts = [0, -1, 0.5, Number.POSITIVE_INFINITY, Number.NaN];
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text' as const,
    };

    for (const iterations of invalidCounts) {
      expect(() =>
        createPliteBrowserWarmLoopSteps({
          createIteration: () => [{ kind: 'focus' }],
          iterations,
        })
      ).toThrow();
      expect(() =>
        createPliteBrowserDestructiveEditingGauntlet({
          followUpText: 'a',
          pasteSelection: selection,
          pastedText: 'a',
          tailBlockTextsAfterWordDelete: [],
          textAfterDeleteAfterPaste: 'a',
          textAfterFollowUp: 'a',
          textAfterPaste: 'a',
          wordDeleteIterations: iterations,
          wordDeleteSelection: selection,
        })
      ).toThrow();
    }
  });

  test('creates iteration-level reduction candidates for warm loops', () => {
    const steps = createPliteBrowserWarmLoopSteps({
      createIteration: (iteration) => [
        { kind: 'focus', label: `focus-${iteration}` },
        { kind: 'type', label: `type-${iteration}`, text: `${iteration}` },
      ],
      label: 'warm-toolbar',
      iterations: 2,
    });

    const summaries = createScenarioReductionCandidates(steps).map(
      summarizeScenarioReductionCandidate
    );

    expect(summaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'iteration',
          label: 'warm-toolbar:iteration:1',
          removedRange: { end: 2, start: 0 },
          stepLabels: ['focus-2', 'type-2'],
        }),
        expect.objectContaining({
          kind: 'iteration',
          label: 'warm-toolbar:iteration:2',
          removedRange: { end: 4, start: 2 },
          stepLabels: ['focus-1', 'type-1'],
        }),
      ])
    );
  });

  test('matches absent commands and partial-DOM kernel ownership exactly', () => {
    const entry = {
      command: null,
      selectionSource: 'partial-dom-backed',
      stateAfter: 'partial-dom-backed',
      stateBefore: 'partial-dom-backed',
      targetOwner: 'partial-dom',
    } as PliteBrowserKernelTraceEntry;

    expect(matchesPliteBrowserKernelTrace(entry, { commandKind: null })).toBe(
      true
    );
    expect(
      matchesPliteBrowserKernelTrace(entry, {
        selectionSource: 'partial-dom-backed',
        stateAfter: 'partial-dom-backed',
        stateBefore: 'partial-dom-backed',
        targetOwner: 'partial-dom',
      })
    ).toBe(true);
    expect(
      createScenarioReplay([
        {
          kind: 'assertKernelTrace',
          trace: {
            commandKind: 'transpose-character',
            movement: {
              axis: 'document',
              reason: 'model-document-boundary',
            },
            selectionPolicy: {
              kind: 'partial-dom',
              reason: 'partial-dom-backed',
            },
            selectionSource: 'partial-dom-backed',
            stateAfter: 'partial-dom-backed',
            targetOwner: 'partial-dom',
          },
        },
      ]).replayable
    ).toBe(true);
  });

  test('normalizes scenario metadata for stable trace artifacts', () => {
    expect(
      normalizeScenarioMetadata({
        capabilities: ['selection', 'keyboard', 'selection'],
        platform: 'chromium',
        transport: 'native-keyboard',
      })
    ).toEqual({
      capabilities: ['keyboard', 'selection'],
      claim: 'desktop-native-keyboard',
      platform: 'chromium',
      transport: 'native-keyboard',
    });

    expect(normalizeScenarioMetadata()).toEqual({
      capabilities: [],
      claim: 'unspecified',
      platform: null,
      transport: null,
    });
  });

  test('classifies mobile transports without upgrading semantic handles to native proof', () => {
    expect(
      classifyScenarioTransportClaim({
        platform: 'mobile',
        transport: 'semantic-handle',
      })
    ).toBe('mobile-semantic-handle');
    expect(
      classifyScenarioTransportClaim({
        platform: 'mobile',
        transport: 'keyboard-and-handle',
      })
    ).toBe('mobile-semantic-handle');
    expect(
      classifyScenarioTransportClaim({
        platform: 'mobile',
        transport: 'synthetic-datatransfer-drop',
      })
    ).toBe('synthetic-datatransfer');
    expect(
      classifyScenarioTransportClaim({
        platform: 'mobile',
        transport: 'synthetic-composition',
      })
    ).toBe('mobile-synthetic-composition');
    expect(
      classifyScenarioTransportClaim({
        platform: 'chromium',
        transport: 'native-composition',
      })
    ).toBe('desktop-native-ime-composition');
  });
});
