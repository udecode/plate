import { createServer } from 'node:net';

import {
  buildPlaywrightCommand,
  buildSlateBrowserBuildCommand,
  commandKeyFor,
  extractFailuresFromPlaywrightReport,
  findAvailablePort,
  getRunReuseDecision,
  renderFailuresMarkdown,
  renderPickupMarkdown,
  splitPlaywrightArgs,
} from './integration-local-async.mjs';

describe('integration-local async failure summaries', () => {
  test('extracts failed Playwright tests from nested suites', () => {
    const failures = extractFailuresFromPlaywrightReport({
      suites: [
        {
          file: 'playwright/integration/examples/richtext.test.ts',
          specs: [
            {
              line: 42,
              ok: false,
              tests: [
                {
                  projectName: 'chromium',
                  results: [
                    {
                      error: { message: 'Expected paragraph text to match' },
                      status: 'failed',
                    },
                  ],
                },
              ],
              title: 'keeps selection after toolbar click',
            },
          ],
          title: 'richtext example',
        },
      ],
    });

    expect(failures).toEqual([
      {
        file: 'playwright/integration/examples/richtext.test.ts',
        line: 42,
        message: 'Expected paragraph text to match',
        project: 'chromium',
        status: 'failed',
        title: 'richtext example > keeps selection after toolbar click',
      },
    ]);
  });

  test('renders a concise failure inbox', () => {
    const markdown = renderFailuresMarkdown({
      exitCode: 1,
      fallbackText: '',
      failures: [
        {
          file: 'playwright/integration/examples/tables.test.ts',
          line: 10,
          message: 'Timeout 30000ms exceeded',
          project: 'webkit',
          status: 'timedOut',
          title: 'tables example > selects cells',
        },
      ],
      runId: '2026-05-27T08-00-00-000Z',
    });

    expect(markdown).toContain('Failures: 1');
    expect(markdown).toContain('tables example > selects cells');
    expect(markdown).toContain(
      'playwright/integration/examples/tables.test.ts:10'
    );
    expect(markdown).toContain('Timeout 30000ms exceeded');
  });

  test('renders command output when Playwright does not produce JSON', () => {
    const markdown = renderFailuresMarkdown({
      exitCode: 1,
      fallbackText: 'Project "__missing_project__" not found',
      failures: [],
      parseError: 'Unexpected end of JSON input',
      runId: '2026-05-27T08-05-00-000Z',
    });

    expect(markdown).toContain('Playwright JSON report could not be parsed.');
    expect(markdown).toContain('Project "__missing_project__" not found');
    expect(markdown).toContain('No test failures parsed.');
  });

  test('uses focused Playwright targets when provided', () => {
    expect(
      splitPlaywrightArgs([
        'playwright/integration/examples/hidden-content-blocks.test.ts',
        '--project=chromium',
      ])
    ).toEqual({
      passthrough: ['--project=chromium'],
      targets: [
        'playwright/integration/examples/hidden-content-blocks.test.ts',
      ],
    });

    expect(splitPlaywrightArgs(['--project=chromium'])).toEqual({
      passthrough: ['--project=chromium'],
      targets: ['playwright/integration'],
    });
  });

  test('builds slate-browser before async Playwright integration', () => {
    expect(buildSlateBrowserBuildCommand()).toEqual([
      'bun',
      '--filter',
      '@platejs/browser',
      'build',
    ]);

    expect(buildPlaywrightCommand(['--project=chromium'])).toEqual([
      expect.stringContaining('/node_modules/.bin/playwright'),
      'test',
      'playwright/integration',
      '--reporter=json',
      '--project=chromium',
    ]);

    expect(
      buildPlaywrightCommand(
        ['playwright/integration/examples/huge-document.test.ts'],
        ['--output=.tmp/integration-runs/run/test-results']
      )
    ).toEqual([
      expect.stringContaining('/node_modules/.bin/playwright'),
      'test',
      'playwright/integration/examples/huge-document.test.ts',
      '--reporter=json',
      '--output=.tmp/integration-runs/run/test-results',
    ]);
  });

  test('skips ports that are already bound', async () => {
    const server = createServer();

    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected server to listen on a TCP port');
    }

    try {
      await expect(findAvailablePort(address.port)).resolves.not.toBe(
        address.port
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });

  test('renders pickup guidance for failed runs', () => {
    const markdown = renderPickupMarkdown({
      failuresText: '# Integration run x\n\nExit code: 1\n',
      status: {
        command: [
          'playwright',
          'test',
          'playwright/integration/examples/richtext.test.ts',
          '--reporter=json',
          '--project=chromium',
        ],
        cwd: '/repo',
        exitCode: 1,
        failureCount: 1,
        failuresPath: '/repo/.tmp/integration-runs/x/failures.md',
        phase: 'complete',
        rawLogPath: '/repo/.tmp/integration-runs/x/raw.log',
        runId: 'x',
        status: 'failed',
      },
    });

    expect(markdown).toContain('# Integration pickup x');
    expect(markdown).toContain('- Status: failed');
    expect(markdown).toContain('Fix the listed browser failures');
    expect(markdown).toContain('## Failure inbox');
  });

  test('renders pickup guidance for running runs', () => {
    const markdown = renderPickupMarkdown({
      status: {
        runId: 'x',
        status: 'running',
      },
    });

    expect(markdown).toContain('Wait for the run to finish');
  });

  test('reuses a compatible running run across agents', () => {
    const commandKey = commandKeyFor([
      'playwright',
      'test',
      'playwright/integration',
      '--reporter=json',
    ]);

    expect(
      getRunReuseDecision({
        live: true,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey,
          runId: 'run-a',
          sourceStamp: 'sha256:current',
          status: 'running',
        },
      })
    ).toEqual({
      reason: 'same-running-run',
      reuse: true,
    });
  });

  test('rejects running runs for different commands or source stamps', () => {
    const commandKey = commandKeyFor(['playwright', 'test', 'a']);

    expect(
      getRunReuseDecision({
        live: true,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey: commandKeyFor(['playwright', 'test', 'b']),
          sourceStamp: 'sha256:current',
          status: 'running',
        },
      }).reason
    ).toBe('different-command');

    expect(
      getRunReuseDecision({
        live: true,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey,
          sourceStamp: 'sha256:old',
          status: 'running',
        },
      }).reason
    ).toBe('different-source-stamp');
  });

  test('reuses completed runs only for the same command and source stamp', () => {
    const commandKey = commandKeyFor(['playwright', 'test', 'a']);

    expect(
      getRunReuseDecision({
        live: false,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey,
          sourceStamp: 'sha256:current',
          status: 'passed',
        },
      })
    ).toEqual({
      reason: 'same-completed-run',
      reuse: true,
    });

    expect(
      getRunReuseDecision({
        live: false,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey,
          status: 'passed',
        },
      }).reason
    ).toBe('missing-source-stamp');

    expect(
      getRunReuseDecision({
        live: false,
        requestedCommandKey: commandKey,
        requestedSourceStamp: 'sha256:current',
        status: {
          commandKey,
          sourceStamp: 'sha256:current',
          status: 'running',
        },
      }).reason
    ).toBe('not-cacheable-status');
  });
});
