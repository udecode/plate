import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as PliteBrowserBrowser from '../../src/browser';
import * as PliteBrowserCore from '../../src/core';
import * as PliteBrowserPlaywright from '../../src/playwright';
import * as PliteBrowserTransports from '../../src/transports';

const expectedPliteBrowserRuntimeSubpathExports = {
  browser: [
    'inspectZeroWidthPlaceholder',
    'takeDOMSelectionSnapshot',
    'takeEditorSelectionSnapshot',
  ],
  core: [
    'PLITE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY',
    'PLITE_BROWSER_FIRST_PARTY_OPERATION_FAMILY_CONTRACTS',
    'PLITE_BROWSER_FIRST_PARTY_PARITY_FAMILIES',
    'PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS',
    'assertPliteBrowserFirstPartyParityContracts',
    'assertPliteBrowserReleaseProof',
    'createBrowserMobileReleaseProofArtifact',
    'createPersistentBrowserSoakProofArtifact',
    'createReleaseDisciplineProofArtifact',
    'createPliteBrowserFeatureContractRegistry',
    'definePliteBrowserFeatureContract',
    'evaluateImeInput',
    'evaluatePlaceholderInput',
    'extractAgentBrowserDebugSnapshot',
    'extractAppiumDebugSnapshot',
    'isCollapsed',
    'parseAgentBrowserBatch',
    'parseDebugSnapshot',
    'serializePoint',
    'serializeRange',
    'validatePliteBrowserReleaseProof',
  ],
  playwright: [
    'assertNoIllegalKernelTransitions',
    'assertPliteBrowserCaretVisibleInScrollableParent',
    'assertPliteBrowserKernelTraceEntry',
    'assertPliteBrowserSelectionContract',
    'attachPageScreenshot',
    'attachPliteBrowserJsonArtifact',
    'attachPliteBrowserSelectionScreenshot',
    'classifyScenarioTransportClaim',
    'createScenarioReductionCandidates',
    'createScenarioReplay',
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
    'getIllegalKernelTransitions',
    'getPliteReactRenderProfilerSnapshot',
    'installPliteReactRenderProfiler',
    'matchesPliteBrowserKernelTrace',
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
  transports: [
    'AGENT_BROWSER_IOS_DEVICE_DEFAULT',
    'AGENT_BROWSER_IOS_SESSION_DEFAULT',
    'ANDROID_SDK_ROOT_DEFAULT',
    'APPIUM_ANDROID_EMULATOR_DEFAULT',
    'APPIUM_IOS_DEVICE_DEFAULT',
    'buildAgentBrowserIosBatch',
    'classifyBrowserMobileTransportProof',
    'createAgentBrowserIosDescriptor',
    'createAppiumAndroidDescriptor',
    'createAppiumIosDescriptor',
    'createAppiumIosSessionPayload',
    'createAppiumSessionPayload',
    'createBrowserMobileUrl',
    'getBrowserMobileTransportProofMatrix',
    'resolveBrowserMobileSurface',
  ],
};

const transportSourceFiles = [
  'agent-browser.ts',
  'appium.ts',
  'contracts.ts',
] as const;

describe('package scripts', () => {
  test('keeps public subpath runtime values exact', () => {
    expect({
      browser: Object.keys(PliteBrowserBrowser).sort(),
      core: Object.keys(PliteBrowserCore).sort(),
      playwright: Object.keys(PliteBrowserPlaywright).sort(),
      transports: Object.keys(PliteBrowserTransports).sort(),
    }).toEqual({
      browser: expectedPliteBrowserRuntimeSubpathExports.browser.toSorted(),
      core: expectedPliteBrowserRuntimeSubpathExports.core.toSorted(),
      playwright: expectedPliteBrowserRuntimeSubpathExports.playwright.toSorted(),
      transports: expectedPliteBrowserRuntimeSubpathExports.transports.toSorted(),
    });
  });

  test('keeps public subpath exports documented in source', () => {
    const missing: string[] = [];

    for (const subpath of ['browser', 'core', 'playwright', 'transports']) {
      const sourceRoot = fileURLToPath(
        new URL(`../../src/${subpath}/`, import.meta.url)
      );
      const indexSource = readFileSync(
        fileURLToPath(
          new URL(`../../src/${subpath}/index.ts`, import.meta.url)
        ),
        'utf8'
      );

      for (const match of indexSource.matchAll(
        /export \{([^}]+)\} from '([^']+)'/g
      )) {
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
      'utf8'
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

  test('keeps transport exports documented in source', () => {
    const missing: string[] = [];

    for (const file of transportSourceFiles) {
      const source = readFileSync(
        fileURLToPath(new URL(`../../src/transports/${file}`, import.meta.url)),
        'utf8'
      );

      for (const match of source.matchAll(
        /export\s+(?:type|interface|const|function|class)\s+([A-Za-z0-9_]+)/g
      )) {
        const [declaration, name] = match;
        const declarationIndex = match.index ?? source.indexOf(declaration);
        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(`${file}/${name}: missing immediate source JSDoc`);
        }
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
      'utf8'
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const scripts = packageJson.scripts;

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
    const coreIndex = readFileSync(coreIndexPath, 'utf8');

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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      exports: Record<string, unknown>;
      main?: string;
      module?: string;
      types?: string;
    };
    const tsdownConfig = readFileSync(
      fileURLToPath(new URL('../../tsdown.config.mts', import.meta.url)),
      'utf8'
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
      './transports',
    ]);
    expect(tsdownConfig).not.toContain("index: 'src/index.ts'");
    expect(tsdownConfig).toContain("'core/index': 'src/core/index.ts'");
    expect(tsdownConfig).toContain("'browser/index': 'src/browser/index.ts'");
    expect(tsdownConfig).toContain(
      "'playwright/index': 'src/playwright/index.ts'"
    );
    expect(tsdownConfig).toContain(
      "'transports/index': 'src/transports/index.ts'"
    );
  });

  test('keeps the package README explicit about subpath proof APIs', () => {
    const readme = readFileSync(
      fileURLToPath(new URL('../../README.md', import.meta.url)),
      'utf8'
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
    expect(readme).toContain('@platejs/browser/transports');
    expect(readme).not.toContain('DOM selection and zero-width helpers');
  });
});
