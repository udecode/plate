import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  assertPliteBrowserFirstPartyParityContracts,
  PLITE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY,
  PLITE_BROWSER_FIRST_PARTY_PARITY_FAMILIES,
} from '../../src/core';
import {
  classifyScenarioTransportClaim,
  createScenarioReductionCandidates,
  createScenarioReplay,
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
  normalizeScenarioMetadata,
  type PliteBrowserScenarioStep,
  serializeScenarioStepForReplay,
  summarizeScenarioReductionCandidate,
} from '../../src/playwright';

describe('scenario helpers', () => {
  test('creates prefix, suffix, and single-step reduction candidates', () => {
    const steps: PliteBrowserScenarioStep[] = [
      { kind: 'focus', label: 'focus' },
      {
        kind: 'select',
        label: 'select',
        selection: {
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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const scripts = packageJson.scripts;

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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const scripts = packageJson.scripts;
    const docs = [
      readFileSync(readmePath, 'utf8'),
      readFileSync(contributingPath, 'utf8'),
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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const scripts = packageJson.scripts;

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
      'utf8'
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
      'utf8'
    );
    const stressDesktopProjectsSource = readFileSync(
      fileURLToPath(
        new URL(
          '../../../../scripts/stress/desktop-projects.mjs',
          import.meta.url
        )
      ),
      'utf8'
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
    const readme = readFileSync(readmePath, 'utf8');

    if (!existsSync(sourcePath)) {
      expect(readme).toContain('@platejs/browser');
      return;
    }

    const source = readFileSync(sourcePath, 'utf8');

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
    const source = readFileSync(sourcePath, 'utf8');

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
    const source = readFileSync(sourcePath, 'utf8');
    const caretSource = readFileSync(caretSourcePath, 'utf8');
    const typeSource = readFileSync(typeSourcePath, 'utf8');
    const readme = readFileSync(readmePath, 'utf8');

    expect(typeSource).toContain('noVisibleCaretInRoot: () => Promise<void>');
    expect(caretSource).toContain('assertNoVisibleCaretInRoot');
    expect(source).toContain('await assertNoVisibleCaretInRoot(root)');
    expect(readme).toContain('editor.assert.noVisibleCaretInRoot()');
  });

  test('summarizes reduction candidates without serializing step functions', () => {
    const steps: PliteBrowserScenarioStep[] = [
      {
        kind: 'custom',
        label: 'custom-step',
        run: () => {},
      },
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
        replayable: false,
        steps: [
          {
            kind: 'custom',
            label: 'custom-step',
            replayable: false,
            summary: 'custom-step: custom non-replayable',
            value: {
              kind: 'custom',
              label: 'custom-step',
            },
          },
        ],
      },
      stepLabels: ['custom-step'],
      stepSummaries: ['custom-step: custom non-replayable'],
    });
  });

  test('serializes replayable scenario steps with action payloads', () => {
    const step: PliteBrowserScenarioStep = {
      iteration: 2,
      kind: 'select',
      label: 'select-word',
      selection: {
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
      iteration: undefined,
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
      warmLoop: undefined,
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
      iteration: undefined,
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
      warmLoop: undefined,
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
        kind: 'captureRuntimeId',
        label: 'capture-image-runtime-id',
        name: 'image',
        path: [1],
      },
      {
        kind: 'applyOperations',
        label: 'remote-remove-image',
        operations: [
          {
            type: 'remove_node',
            path: [1],
            node: { type: 'image', url: 'image.png', children: [{ text: '' }] },
          },
        ],
        tag: 'remote-import',
      },
      {
        kind: 'assertCapturedRuntimeIdPath',
        label: 'assert-image-runtime-id-null',
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
      'captureRuntimeId',
      'applyOperations',
      'assertCapturedRuntimeIdPath',
      'assertLastCommitTags',
      'assertWindowSelectionText',
      'assertSelectionContract',
      'assertRenderBudget',
      'resetRenderProfiler',
    ]);
  });

  test('marks custom scenario steps as non-replayable without serializing functions', () => {
    const replay = createScenarioReplay([
      {
        kind: 'custom',
        label: 'custom-step',
        run: () => {},
      },
      { kind: 'type', label: 'type-step', text: 'A' },
    ]);

    expect(replay).toEqual({
      replayable: false,
      steps: [
        {
          iteration: undefined,
          kind: 'custom',
          label: 'custom-step',
          replayable: false,
          summary: 'custom-step: custom non-replayable',
          value: {
            kind: 'custom',
            label: 'custom-step',
          },
          warmLoop: undefined,
        },
        {
          iteration: undefined,
          kind: 'type',
          label: 'type-step',
          replayable: true,
          summary: 'type-step: type "A" len=1',
          value: {
            kind: 'type',
            label: 'type-step',
            text: 'A',
          },
          warmLoop: undefined,
        },
      ],
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
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 16 },
        },
        selectedText: 'editable',
        selectionAfterArrowLeft: {
          anchor: { path: [0, 1], offset: 7 },
          focus: { path: [0, 1], offset: 7 },
        },
        selectionAfterCollapse: {
          anchor: { path: [0, 1], offset: 8 },
          focus: { path: [0, 1], offset: 8 },
        },
        selectionAfterInsert: {
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
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const selected = {
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
      pastedText: 'Paste',
      selectionAfterDeleteAfterPaste: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      selectionAfterFollowUp: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
      selectionAfterPaste: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
      tailBlockTextsAfterWordDelete: ['tail'],
      textAfterDeleteAfterPaste: 'Past text',
      textAfterFollowUp: 'Past! text',
      textAfterPaste: 'Paste text',
      wordDeleteIterations: 2,
      wordDeleteSelection: {
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
