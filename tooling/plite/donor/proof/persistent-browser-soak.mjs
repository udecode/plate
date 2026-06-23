#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, selectors } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const port = process.env.PORT ?? '3101';
const hasExternalBaseUrl = Boolean(
  process.env.PLITE_BROWSER_SOAK_BASE_URL || process.env.PLAYWRIGHT_BASE_URL
);
const baseUrl =
  process.env.PLITE_BROWSER_SOAK_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${port}`;
const MIN_SOAK_ITERATIONS = 5;
const parseSoakIterations = () => {
  const raw = process.env.PLITE_BROWSER_SOAK_ITERATIONS ?? '5';
  const iterations = Number(raw);

  if (!Number.isInteger(iterations) || iterations < MIN_SOAK_ITERATIONS) {
    throw new Error(
      `PLITE_BROWSER_SOAK_ITERATIONS must be an integer >= ${MIN_SOAK_ITERATIONS}`
    );
  }

  return iterations;
};
const iterations = parseSoakIterations();
const artifactPath = resolve(
  repoRoot,
  process.env.PLITE_BROWSER_SOAK_ARTIFACT ??
    'test-results/release-proof/persistent-browser-soak.json'
);
const userDataDir =
  process.env.PLITE_BROWSER_SOAK_USER_DATA_DIR ??
  mkdtempSync(resolve(tmpdir(), 'plite-browser-soak-'));
const shouldRemoveProfile = !process.env.PLITE_BROWSER_SOAK_USER_DATA_DIR;

process.env.PLAYWRIGHT_BASE_URL = baseUrl;
selectors.setTestIdAttribute('data-test-id');

const waitForUrl = async (url, timeoutMs = 30_000) => {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }

      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw lastError ?? new Error(`${url} did not become ready`);
};

const startServer = async () => {
  if (hasExternalBaseUrl) {
    return null;
  }

  try {
    await waitForUrl(`${baseUrl}/examples/richtext`, 1000);
    return null;
  } catch {
    // No existing server is ready on the soak port.
  }

  if (!existsSync(resolve(repoRoot, 'site/out/examples/richtext.html'))) {
    throw new Error(
      'Missing site/out. Run `bun build:next` or set PLITE_BROWSER_SOAK_BASE_URL to an already-running site.'
    );
  }

  const server = spawn('node', ['./scripts/serve-playwright.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));

  await waitForUrl(`${baseUrl}/examples/richtext`);

  return server;
};

const stopServer = async (server) => {
  if (!server || server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  const exit = new Promise((resolveExit) => {
    server.once('exit', resolveExit);
  });

  server.kill();

  if (
    (await Promise.race([
      exit,
      new Promise((resolveTimeout) =>
        setTimeout(() => resolveTimeout('timeout'), 2000)
      ),
    ])) !== 'timeout'
  ) {
    return;
  }

  server.kill('SIGKILL');
  await Promise.race([
    exit,
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 1000)),
  ]);
};

const createWarmIterationOverride = () => ({
  markDOMSelection: {
    anchorNodeText: 'editable',
    anchorOffset: 0,
    focusNodeText: 'editable',
    focusOffset: 8,
  },
  markSelection: {
    anchor: { path: [0, 1], offset: 0 },
    focus: { path: [0, 1], offset: 8 },
  },
  selectionAfterArrowLeft: {
    anchor: { path: [0, 1], offset: 7 },
    focus: { path: [0, 1], offset: 7 },
  },
  selectionAfterCollapse: {
    anchor: { path: [0, 1], offset: 8 },
    focus: { path: [0, 1], offset: 8 },
  },
});

const writeArtifact = (artifact) => {
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
};

let server = null;
let context = null;

try {
  server = await startServer();

  const [
    {
      assertNoIllegalKernelTransitions,
      createPliteBrowserDestructiveEditingGauntlet,
      createPliteBrowserWarmToolbarArrowGauntlet,
      openExample,
    },
    {
      assertPliteBrowserReleaseProof,
      createPersistentBrowserSoakProofArtifact,
    },
  ] = await Promise.all([
    import(
      new URL('../../packages/browser/src/playwright/index.ts', import.meta.url)
        .href
    ),
    import(
      new URL(
        '../../packages/browser/src/core/release-proof.ts',
        import.meta.url
      ).href
    ),
  ]);

  context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.HEADLESS !== '0',
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { height: 720, width: 1280 },
  });
  const destructivePage = await context.newPage();
  const destructiveEditor = await openExample(destructivePage, 'richtext', {
    ready: { editor: 'visible' },
  });
  const tailBlockTexts = [
    "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
    'A wise quote.',
    'Try it out for yourself!',
  ];
  const firstBlockAfterPaste =
    'Paste is editable rich text, much better than a <textarea>!';
  const firstBlockAfterDeleteAfterPaste =
    'Past is editable rich text, much better than a <textarea>!';
  const firstBlockAfterFollowUp =
    'Past! is editable rich text, much better than a <textarea>!';
  const destructiveResult = await destructiveEditor.scenario.run(
    'richtext-persistent-browser-destructive-editing-soak',
    createPliteBrowserDestructiveEditingGauntlet({
      domShape: {
        afterDeleteAfterPaste: {
          blockIndex: 0,
          innerText: firstBlockAfterDeleteAfterPaste,
          noUnexpectedZeroWidthBreaks: true,
          textContent: firstBlockAfterDeleteAfterPaste,
          zeroWidthBreakCount: 0,
        },
        afterFollowUp: {
          blockIndex: 0,
          innerText: firstBlockAfterFollowUp,
          noUnexpectedZeroWidthBreaks: true,
          textContent: firstBlockAfterFollowUp,
          zeroWidthBreakCount: 0,
        },
        afterPaste: {
          blockIndex: 0,
          innerText: firstBlockAfterPaste,
          noUnexpectedZeroWidthBreaks: true,
          textContent: firstBlockAfterPaste,
          zeroWidthBreakCount: 0,
        },
        afterWordDeleteFollowUp: {
          blockIndex: 0,
          noUnexpectedZeroWidthBreaks: true,
          zeroWidthBreakCount: 0,
        },
        afterWordDeleteIterations: Array.from(
          { length: Math.max(1, Math.min(iterations, 5)) },
          () => ({
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          })
        ),
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
      tailBlockTextsAfterWordDelete: tailBlockTexts,
      textAfterDeleteAfterPaste: firstBlockAfterDeleteAfterPaste,
      textAfterFollowUp: firstBlockAfterFollowUp,
      textAfterPaste: firstBlockAfterPaste,
      wordDeleteIterations: Math.max(1, Math.min(iterations, 5)),
      wordDeleteSelection: {
        anchor: { path: [0, 6], offset: 1 },
        focus: { path: [0, 6], offset: 1 },
      },
    }),
    {
      metadata: {
        capabilities: [
          'delete',
          'generated-gauntlet',
          'kernel-trace',
          'paste',
          'persistent-profile',
          'word-delete',
        ],
        platform: 'chromium',
        transport: 'persistent-profile-native-keyboard-and-clipboard',
      },
    }
  );
  assertNoIllegalKernelTransitions(destructiveResult);

  if (!destructiveResult.replay.replayable) {
    throw new Error('Persistent destructive editing soak was not replayable');
  }

  const page = await context.newPage();
  const editor = await openExample(page, 'richtext', {
    ready: { editor: 'visible' },
  });
  const warmIterationOverrides = Array.from(
    { length: iterations },
    (_, index) => (index === 0 ? {} : createWarmIterationOverride())
  );
  const warmToolbarResult = await editor.scenario.run(
    'richtext-persistent-browser-warm-toolbar-soak',
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
      warmIterationOverrides,
      warmIterations: iterations,
    }),
    {
      metadata: {
        capabilities: [
          'caret',
          'dom-selection',
          'generated-gauntlet',
          'kernel-trace',
          'persistent-profile',
          'toolbar-command',
          'warm-state',
        ],
        platform: 'chromium',
        transport: 'persistent-profile-native-click-and-keyboard',
      },
    }
  );

  assertNoIllegalKernelTransitions(warmToolbarResult);

  if (!warmToolbarResult.replay.replayable) {
    throw new Error('Persistent browser soak scenario was not replayable');
  }

  if (
    !warmToolbarResult.reductionCandidates.some(
      (candidate) =>
        candidate.kind === 'iteration' && candidate.replay.replayable
    )
  ) {
    throw new Error(
      'Persistent browser soak did not produce replayable iteration shrink artifacts'
    );
  }

  const artifact = createPersistentBrowserSoakProofArtifact({
    browserName: 'chromium',
    iterations,
    passed: true,
    profilePersistence: 'persistent',
    replayable:
      destructiveResult.replay.replayable &&
      warmToolbarResult.replay.replayable,
    scenario: 'richtext-persistent-browser-destructive-and-toolbar-soak',
  });

  assertPliteBrowserReleaseProof({
    artifacts: [artifact],
    claims: ['persistent-browser-caret-soak'],
    requiredSoakIterations: iterations,
  });

  writeArtifact({
    artifact,
    results: {
      destructiveEditing: destructiveResult,
      warmToolbar: warmToolbarResult,
    },
  });
  console.log(
    `[plite-browser-soak] passed ${iterations} persistent-profile iterations: ${artifactPath}`
  );
} catch (error) {
  writeArtifact({
    artifact: {
      browserName: 'chromium',
      iterations,
      kind: 'persistent-browser-soak',
      passed: false,
      profilePersistence: 'persistent',
      replayable: false,
      scenario: 'richtext-persistent-browser-warm-toolbar-soak',
    },
    error: error instanceof Error ? error.message : String(error),
  });
  throw error;
} finally {
  await context?.close();
  await stopServer(server);

  if (shouldRemoveProfile) {
    rmSync(userDataDir, { force: true, recursive: true });
  }
}
