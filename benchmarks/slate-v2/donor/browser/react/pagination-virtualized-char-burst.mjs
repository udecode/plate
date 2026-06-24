import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import handler from 'serve-handler';
import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const siteOutRoot = fileURLToPath(
  new URL('../../../../site/out', import.meta.url)
);
const siteRoot = fileURLToPath(new URL('../../../../site', import.meta.url));
const reportPath =
  process.env.SLATE_PAGINATION_CHAR_BURST_REPORT ||
  'tmp/slate-pagination-virtualized-char-burst-playwright.json';
const artifactPath =
  process.env.SLATE_PAGINATION_CHAR_BURST_ARTIFACT ||
  'tmp/slate-pagination-virtualized-char-burst-benchmark.json';
const grep =
  'keeps (staged burst typing responsive|staged typing responsive in a 500-row|rows=800 virtualized pagination in the staged-class perf envelope)';
const useDevServer = process.env.SLATE_PAGINATION_CHAR_BURST_DEV === '1';
const skipStaticBuild =
  process.env.SLATE_PAGINATION_CHAR_BURST_SKIP_BUILD === '1' ||
  process.env.SLATE_PAGINATION_CHAR_BURST_SKIP_STATIC_BUILD === '1';

const runStaticBuild = async () =>
  new Promise((resolve, reject) => {
    if (skipStaticBuild) {
      resolve();
      return;
    }

    const child = spawn('bun', ['next', 'build'], {
      cwd: siteRoot,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logs = [];
    const collectLog = (chunk) => {
      logs.push(Buffer.from(chunk));
      if (logs.length > 40) {
        logs.shift();
      }
    };

    child.stdout.on('data', collectLog);
    child.stderr.on('data', collectLog);
    child.once('error', reject);
    child.once('exit', (status) => {
      if (status === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Pagination benchmark static build exited with ${status}:\n${Buffer.concat(
            logs
          ).toString('utf8')}`
        )
      );
    });
  });

const startStaticServer = async () => {
  await runStaticBuild();

  const server = createServer((request, response) => {
    Promise.resolve()
      .then(() =>
        handler(request, response, {
          cleanUrls: true,
          directoryListing: false,
          public: siteOutRoot,
        })
      )
      .catch((error) => {
        console.error('Pagination benchmark server failed:', error);

        if (response.headersSent) {
          response.destroy();
          return;
        }

        response.statusCode = 500;
        response.end('Internal Server Error');
      });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const port =
    typeof address === 'object' && address !== null ? address.port : null;

  if (!port) {
    throw new Error('Unable to allocate pagination benchmark server port');
  }

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    url: `http://127.0.0.1:${port}`,
  };
};

const getOpenPort = async () => {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const port =
    typeof address === 'object' && address !== null ? address.port : null;

  await new Promise((resolve) => server.close(resolve));

  if (!port) {
    throw new Error('Unable to allocate pagination benchmark dev server port');
  }

  return port;
};

const waitForURL = async (url, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Timed out waiting for pagination benchmark server at ${url}: ${
      lastError instanceof Error ? lastError.message : 'not ready'
    }`
  );
};

const startNextDevServer = async () => {
  const port = await getOpenPort();
  const child = spawn('bun', ['next', 'dev', '-p', String(port)], {
    cwd: siteRoot,
    detached: true,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  const collectLog = (chunk) => {
    logs.push(Buffer.from(chunk));
    if (logs.length > 20) {
      logs.shift();
    }
  };

  child.stdout.on('data', collectLog);
  child.stderr.on('data', collectLog);

  const exitPromise = new Promise((_, reject) => {
    child.once('exit', (status) => {
      reject(
        new Error(
          `Pagination benchmark dev server exited with ${status}:\n${Buffer.concat(
            logs
          ).toString('utf8')}`
        )
      );
    });
  });
  const url = `http://127.0.0.1:${port}`;

  await Promise.race([waitForURL(`${url}/examples/pagination`), exitPromise]);

  return {
    close: () =>
      new Promise((resolve) => {
        let resolved = false;
        const finish = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        const killGroup = (signal) => {
          try {
            process.kill(-child.pid, signal);
          } catch {
            try {
              child.kill(signal);
            } catch {}
          }
        };

        killGroup('SIGTERM');
        setTimeout(() => {
          killGroup('SIGKILL');
          finish();
        }, 5000);
        child.once('exit', finish);
      }),
    url,
  };
};

const runPlaywright = async (baseURL) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'bun',
      [
        'run',
        'playwright',
        '--',
        'playwright/integration/examples/pagination.test.ts',
        '--project=chromium',
        '-g',
        grep,
        '--reporter=json',
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseURL,
          PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath,
          PLAYWRIGHT_RETRIES: process.env.PLAYWRIGHT_RETRIES ?? '0',
          PLAYWRIGHT_WORKERS: process.env.PLAYWRIGHT_WORKERS ?? '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    const stdout = [];
    const stderr = [];

    child.stdout.on('data', (chunk) => {
      stdout.push(Buffer.from(chunk));
    });
    child.stderr.on('data', (chunk) => {
      stderr.push(Buffer.from(chunk));
    });
    child.once('error', reject);
    child.once('exit', (status) => {
      resolve({
        status,
        stderr: Buffer.concat(stderr).toString('utf8'),
        stdout: Buffer.concat(stdout).toString('utf8'),
      });
    });
  });

const server = process.env.SLATE_PAGINATION_CHAR_BURST_BASE_URL
  ? null
  : useDevServer || process.env.SLATE_PAGINATION_CHAR_BURST_STATIC === '0'
    ? await startNextDevServer()
    : await startStaticServer();
const baseURL = process.env.SLATE_PAGINATION_CHAR_BURST_BASE_URL ?? server?.url;

const result = await runPlaywright(baseURL);
await server?.close();

if (result.status !== 0) {
  process.stderr.write(result.stdout);
  process.stderr.write(result.stderr);
}

const report = existsSync(reportPath)
  ? JSON.parse(readFileSync(reportPath, 'utf8'))
  : null;
const attachments = [];

const collectAttachments = (value) => {
  if (!value || typeof value !== 'object') {
    return;
  }
  if (Array.isArray(value.attachments)) {
    attachments.push(...value.attachments);
  }
  for (const child of Object.values(value)) {
    collectAttachments(child);
  }
};

collectAttachments(report);

const jsonAttachment = (name) => {
  const attachment = attachments.find((entry) => entry.name === name);

  if (!attachment?.body) {
    return null;
  }

  return JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8'));
};

const parseJSONAt = (text, startIndex) => {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return JSON.parse(text.slice(startIndex, index + 1));
      }
    }
  }

  return null;
};

const collectErrorMessages = (value, messages = []) => {
  if (!value || typeof value !== 'object') {
    return messages;
  }

  if (typeof value.message === 'string') {
    messages.push(value.message);
  }

  for (const child of Object.values(value)) {
    collectErrorMessages(child, messages);
  }

  return messages;
};

const getFailureSample = () => {
  const marker = 'Timed out waiting for pagination typing paint: ';

  for (const message of collectErrorMessages(report)) {
    const markerIndex = message.indexOf(marker);

    if (markerIndex === -1) {
      continue;
    }

    const jsonStart = message.indexOf('{', markerIndex + marker.length);

    if (jsonStart === -1) {
      continue;
    }

    try {
      return parseJSONAt(message, jsonStart);
    } catch {
      return null;
    }
  }

  return null;
};

const staged = jsonAttachment('pagination-staged-burst-metrics');
const stagedTable = jsonAttachment('pagination-staged-500-row-burst-metrics');
const virtualized = jsonAttachment(
  'pagination-virtualized-rows800-perf-metrics'
);
const failureSample = getFailureSample();
const virtualizedBurstMs =
  virtualized?.burstSettledMs ?? failureSample?.eventToPaintMs ?? 5000;
const stagedTableBurstMs = stagedTable?.burstSettledMs ?? 0;
const virtualizedFailed = result.status === 0 && virtualized ? 0 : 1;

const metrics = {
  pagination_staged_burst_ms: round(staged?.burstSettledMs ?? 0),
  pagination_staged_table_burst_ms: round(stagedTableBurstMs),
  pagination_virtualized_block_visible: virtualized
    ? 1
    : failureSample?.blockVisible
      ? 1
      : 0,
  pagination_virtualized_burst_ms: round(virtualizedBurstMs),
  pagination_virtualized_chars_correct: virtualized
    ? 1
    : failureSample?.hasExpectedText
      ? 1
      : 0,
  pagination_virtualized_dom_nodes:
    virtualized?.finalProof?.totalElementCount ??
    failureSample?.totalElementCount ??
    0,
  pagination_virtualized_failed: virtualizedFailed,
  pagination_virtualized_load_after_dom_ms: round(
    virtualized?.appReadyAfterDOMContentLoadedMs ?? 0
  ),
  pagination_virtualized_max_typing_ms: round(
    virtualized?.maxEventToPaint ?? failureSample?.eventToPaintMs ?? 0
  ),
  pagination_virtualized_page_surfaces:
    virtualized?.finalProof?.pageSurfaceCount ??
    failureSample?.pageSurfaceCount ??
    0,
  pagination_virtualized_p95_typing_ms: round(
    virtualized?.p95EventToPaint ?? failureSample?.eventToPaintMs ?? 0
  ),
  pagination_virtualized_scroll_ms: round(virtualized?.scrollSettledMs ?? 0),
  pagination_virtualized_vs_table_ratio:
    virtualizedFailed && !virtualized
      ? 999
      : round(virtualizedBurstMs / Math.max(1, stagedTableBurstMs)),
};

await writeBenchmarkArtifact(artifactPath, {
  attachments: {
    failureSample,
    staged,
    stagedTable,
    virtualized,
  },
  metrics,
  playwright: {
    reportPath,
    status: result.status,
    stderrTail: result.stderr.slice(-4000),
    stdoutTail: result.stdout.slice(-4000),
  },
});

for (const [name, value] of Object.entries(metrics)) {
  console.log(`METRIC ${name}=${value}`);
}

console.log(`ARTIFACT pagination_virtualized_char_burst=${artifactPath}`);
