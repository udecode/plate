import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as PliteBrowserBrowser from '../../src/browser';
import * as PliteBrowserCore from '../../src/core';
import * as PliteBrowserPlaywright from '../../src/playwright';

const expectedPliteBrowserRuntimeSubpathExports = {
  browser: [
    'inspectZeroWidthPlaceholder',
    'takeDOMSelectionSnapshot',
    'takeEditorSelectionSnapshot',
  ],
  core: [
    'PLITE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY',
    'PLITE_BROWSER_FIRST_PARTY_INTENT_FAMILY_CONTRACTS',
    'PLITE_BROWSER_FIRST_PARTY_PARITY_FAMILIES',
    'PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS',
    'PLITE_RAW_MOBILE_SCENARIOS',
    'assertPliteBrowserFirstPartyParityContracts',
    'assertPliteBrowserReleaseProof',
    'assertPliteRawMobileProof',
    'classifyBrowserMobileTransportProof',
    'createBrowserMobileReleaseProofArtifact',
    'createPersistentBrowserSoakProofArtifact',
    'createReleaseDisciplineProofArtifact',
    'createPliteBrowserFeatureContractRegistry',
    'definePliteBrowserFeatureContract',
    'evaluateImeInput',
    'evaluatePlaceholderInput',
    'extractAgentBrowserDebugSnapshot',
    'extractAppiumDebugSnapshot',
    'getBrowserMobileTransportProofMatrix',
    'isCollapsed',
    'parseAgentBrowserBatch',
    'parseDebugSnapshot',
    'serializePoint',
    'serializeRange',
    'validatePliteBrowserReleaseProof',
    'validatePliteRawMobileProof',
  ],
  playwright: [
    'assertNoIllegalKernelTransitions',
    'assertPliteBrowserCaretVisibleInScrollableParent',
    'assertPliteBrowserKernelTraceEntry',
    'assertPliteBrowserSelectionContract',
    'attachPageScreenshot',
    'attachPliteBrowserJsonArtifact',
    'attachPliteBrowserSelectionScreenshot',
    'browserStep',
    'classifyScenarioTransportClaim',
    'createScenarioReductionCandidates',
    'createScenarioReplay',
    'decodeScenarioReplay',
    'createPliteBrowserClipboardPasteGauntlet',
    'createPliteBrowserCompositionGauntlet',
    'createPliteBrowserDestructiveEditingGauntlet',
    'createPliteBrowserDropDataGauntlet',
    'createPliteBrowserEditorHarness',
    'createPliteBrowserFeatureContractRegistry',
    'createPliteBrowserInlineCutTypingGauntlet',
    'createPliteBrowserInternalControlGauntlet',
    'createPliteBrowserMarkClickTypingGauntlet',
    'createPliteBrowserMarkTypingGauntlet',
    'createPliteBrowserMixedEditingConformanceGauntlet',
    'createPliteBrowserNavigationTypingGauntlet',
    'createPliteBrowserSemanticEditingConformanceGauntlet',
    'createPliteBrowserShellActivationGauntlet',
    'createPliteBrowserTextInsertionGauntlet',
    'createPliteBrowserToolbarMarkClickTypingGauntlet',
    'createPliteBrowserWarmLoopSteps',
    'createPliteBrowserWarmToolbarArrowGauntlet',
    'definePliteBrowserFeatureContract',
    'findPliteBrowserKernelTraceEntry',
    'getPliteBrowserEditable',
    'getIllegalKernelTransitions',
    'getPliteReactRenderProfilerSnapshot',
    'installPliteReactRenderProfiler',
    'locatePliteBrowserBlock',
    'locatePliteBrowserText',
    'matchesPliteBrowserKernelTrace',
    'measurePliteTrustedTyping',
    'normalizeScenarioMetadata',
    'openExample',
    'openExampleWithOptions',
    'recordPliteBrowserRuntimeErrors',
    'resetPliteBrowserNativeEventTrace',
    'resetPliteReactRenderProfiler',
    'serializeScenarioStepForReplay',
    'startPliteBrowserNativeEventTrace',
    'stopPliteBrowserNativeEventTrace',
    'summarizeScenarioReductionCandidate',
    'summarizeScenarioStep',
    'takeDOMSelectionSnapshot',
    'takeDisplayedSelectionSnapshotForRoot',
    'takeSelectionSnapshot',
    'takePliteBrowserNativeEventTrace',
    'takePliteBrowserRenderStateSnapshot',
    'withExclusiveClipboardAccess',
  ],
};

describe('package scripts', () => {
  test('keeps public subpath runtime values exact', () => {
    expect({
      browser: Object.keys(PliteBrowserBrowser).sort(),
      core: Object.keys(PliteBrowserCore).sort(),
      playwright: Object.keys(PliteBrowserPlaywright).sort(),
    }).toEqual({
      browser: expectedPliteBrowserRuntimeSubpathExports.browser.toSorted(),
      core: expectedPliteBrowserRuntimeSubpathExports.core.toSorted(),
      playwright:
        expectedPliteBrowserRuntimeSubpathExports.playwright.toSorted(),
    });
  });

  test('keeps public subpath exports documented in source', () => {
    const missing: string[] = [];

    for (const subpath of ['browser', 'core', 'playwright']) {
      const sourceRoot = fileURLToPath(
        new URL(`../../src/${subpath}/`, import.meta.url)
      );
      const indexSource = readFileSync(
        fileURLToPath(
          new URL(`../../src/${subpath}/index.ts`, import.meta.url)
        ),
        'utf-8'
      );

      for (const match of indexSource.matchAll(
        /export \{([^}]+)\} from '([^']+)'/g
      )) {
        const [, rawNames, sourceSpecifier] = match;
        const sourcePath = `${sourceRoot}${sourceSpecifier}.ts`;
        const source = readFileSync(sourcePath, 'utf-8');

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
            missing.push(`${subpath}/${name}: missing public declaration`);
            continue;
          }

          const beforeDeclaration = source.slice(
            Math.max(0, declarationIndex - 600),
            declarationIndex
          );

          if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
            missing.push(`${subpath}/${name}: missing immediate source JSDoc`);
          }
        }
      }

      for (const match of indexSource.matchAll(
        /export\s+(?:async\s+)?(?:const|function|class)\s+([A-Za-z0-9_]+)/g
      )) {
        const [declaration, name] = match;
        const declarationIndex =
          match.index ?? indexSource.indexOf(declaration);
        const beforeDeclaration = indexSource.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(`${subpath}/${name}: missing immediate source JSDoc`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('keeps direct playwright exports documented in source', () => {
    const playwrightSource = readFileSync(
      fileURLToPath(new URL('../../src/playwright/index.ts', import.meta.url)),
      'utf-8'
    );
    const missing: string[] = [];

    for (const match of playwrightSource.matchAll(
      /export\s+(?:type|interface|const|function|class)\s+([A-Za-z0-9_]+)/g
    )) {
      const [declaration, name] = match;
      const declarationIndex =
        match.index ?? playwrightSource.indexOf(declaration);
      const beforeDeclaration = playwrightSource.slice(
        Math.max(0, declarationIndex - 600),
        declarationIndex
      );

      if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
        missing.push(`${name}: missing immediate source JSDoc`);
      }
    }

    expect(missing).toEqual([]);
  });

  test('does not rerun selection browser tests from the aggregate test script', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../package.json', import.meta.url)
    );
    const readme = readFileSync(
      fileURLToPath(new URL('../../README.md', import.meta.url)),
      'utf-8'
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    const { scripts } = packageJson;

    expect(scripts.test).toContain('test:core');
    expect(scripts.test).toContain('test:dom');
    expect(scripts.test).not.toContain('test:selection');
    expect(readme).toContain(
      'Run `test:selection` separately when you need the focused browser-selection'
    );
    expect(readme).not.toContain('- `test:dom`\n- `test:selection`');
    expect(scripts['test:dom']).toBe(
      'vitest run --config ./vitest.config.ts --project browser'
    );
  });

  test('keeps core proof helper exports free of proof-suffixed aliases', () => {
    const coreIndexPath = fileURLToPath(
      new URL('../../src/core/index.ts', import.meta.url)
    );
    const coreIndex = readFileSync(coreIndexPath, 'utf-8');

    expect(coreIndex).not.toMatch(/\bas\s+\w+Proof\b/);
    expect(coreIndex).not.toContain('evaluateImeInputProof');
    expect(coreIndex).not.toContain('evaluatePlaceholderInputProof');
    expect(coreIndex).not.toContain('extractAgentBrowserDebugSnapshotProof');
    expect(coreIndex).not.toContain('extractAppiumDebugSnapshotProof');
    expect(coreIndex).not.toContain('parseAgentBrowserBatchProof');
    expect(coreIndex).not.toContain('parseDebugSnapshotProof');
  });

  test('keeps plite-browser metadata public-ready and subpath-only', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../package.json', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      files: string[];
      license: string;
      name: string;
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
      private?: boolean;
      version: string;
    };

    expect(packageJson.name).toBe('@platejs/browser');
    expect(packageJson.private).toBeUndefined();
    expect(packageJson.version).not.toContain('private');
    expect(packageJson.license).toBe('MIT');
    expect(packageJson.files).toEqual(['dist/**/*']);
    expect(packageJson.peerDependencies?.['@playwright/test']).toBe('>=1.52.0');
    expect(
      packageJson.peerDependenciesMeta?.['@playwright/test']?.optional
    ).toBe(true);
  });

  test('keeps plite-browser public entrypoints on owned subpaths', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../package.json', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      exports: Record<string, unknown>;
      main?: string;
      module?: string;
      types?: string;
    };
    const tsdownConfig = readFileSync(
      fileURLToPath(new URL('../../tsdown.config.mts', import.meta.url)),
      'utf-8'
    );

    expect(packageJson.main).toBeUndefined();
    expect(packageJson.module).toBeUndefined();
    expect(packageJson.types).toBeUndefined();
    expect(packageJson.exports['.']).toBeUndefined();
    expect(Object.keys(packageJson.exports).sort()).toEqual([
      './browser',
      './core',
      './package.json',
      './playwright',
    ]);
    expect(tsdownConfig).not.toContain("index: 'src/index.ts'");
    expect(tsdownConfig).toContain("'core/index': 'src/core/index.ts'");
    expect(tsdownConfig).toContain("'browser/index': 'src/browser/index.ts'");
    expect(tsdownConfig).toContain(
      "'playwright/index': 'src/playwright/index.ts'"
    );
  });

  test('keeps the package README explicit about subpath proof APIs', () => {
    const readme = readFileSync(
      fileURLToPath(new URL('../../README.md', import.meta.url)),
      'utf-8'
    );

    for (const name of [
      '@platejs/browser/core',
      'serializePoint',
      'serializeRange',
      'evaluateImeInput',
      'evaluatePlaceholderInput',
      'assertPliteBrowserReleaseProof',
      'validatePliteBrowserReleaseProof',
      'createReleaseDisciplineProofArtifact',
      'createBrowserMobileReleaseProofArtifact',
      'createPersistentBrowserSoakProofArtifact',
      'assertPliteBrowserFirstPartyParityContracts',
      'definePliteBrowserFeatureContract',
      'createPliteBrowserFeatureContractRegistry',
      'debug snapshot parsers',
      '@platejs/browser/browser',
      'takeDOMSelectionSnapshot',
      'takeEditorSelectionSnapshot',
      'inspectZeroWidthPlaceholder',
    ]) {
      expect(readme).toContain(name);
    }

    expect(readme).toContain('@platejs/browser/playwright');
    expect(readme).toContain(
      'Raw-device identity belongs to the executable device runner'
    );
    expect(readme).not.toContain('DOM selection and zero-width helpers');
  });
});
