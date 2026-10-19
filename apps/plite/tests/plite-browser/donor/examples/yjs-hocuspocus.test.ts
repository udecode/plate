import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';
import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';

const repoRoot = path.resolve(__dirname, '../../../../../..');
const bunExecutable = path.join(
  repoRoot,
  'node_modules',
  'bun',
  'bin',
  'bun.exe'
);
const yjsPort = 4444;
let yjsServer: ChildProcess | undefined;
let yjsServerOutput = '';

const canConnect = (timeout = 500) =>
  new Promise<boolean>((resolve) => {
    const socket = net.connect(yjsPort, '127.0.0.1');
    const finish = (connected: boolean) => {
      socket.destroy();
      resolve(connected);
    };

    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.setTimeout(timeout, () => finish(false));
  });

const waitForYjsServer = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30_000) {
    if (await canConnect()) return;
    if (yjsServer?.exitCode !== null) {
      throw new Error(
        `The Hocuspocus test server exited early.\n${yjsServerOutput}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `The Hocuspocus test server did not become ready.\n${yjsServerOutput}`
  );
};

test.beforeAll(async () => {
  if (await canConnect()) return;

  const runId = randomUUID();
  yjsServer = spawn(
    bunExecutable,
    ['tooling/plite/donor/yjs/hocuspocus-server.ts'],
    {
    cwd: repoRoot,
    env: {
      ...process.env,
      PLITE_YJS_STORAGE_DIR: path.join(
        repoRoot,
        '.tmp',
        'yjs-browser',
        runId
      ),
    },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  yjsServer.stdout?.on('data', (chunk) => {
    yjsServerOutput += chunk.toString();
  });
  yjsServer.stderr?.on('data', (chunk) => {
    yjsServerOutput += chunk.toString();
  });
  await waitForYjsServer();
});

test.afterAll(async () => {
  if (!yjsServer || yjsServer.exitCode !== null) return;

  const exited = new Promise<void>((resolve) => {
    yjsServer?.once('exit', () => resolve());
  });

  yjsServer.kill('SIGKILL');
  await exited;
});

const peerUrl = (room: string, peerId: 'a' | 'b') =>
  `/examples/plite/yjs-hocuspocus?connection=manual&peer=${peerId}&room=${room}`;
const admission = (peerPage: Page) =>
  peerPage.locator('[data-admission-status]');
const editor = (peerPage: Page, peerId: 'a' | 'b') =>
  peerPage.locator(`#yjs-peer-${peerId}-editor-surface [contenteditable]`);
const connect = (peerPage: Page, peerId: 'a' | 'b') =>
  peerPage.getByTestId(`yjs-peer-${peerId}-connect`);
const disconnect = (peerPage: Page, peerId: 'a' | 'b') =>
  peerPage.getByTestId(`yjs-peer-${peerId}-disconnect`);

const expectConverged = async (
  peerAEditor: ReturnType<typeof editor>,
  peerBEditor: ReturnType<typeof editor>
) => {
  await expect
    .poll(async () => {
      const [peerAText, peerBText] = await Promise.all([
        peerAEditor.textContent(),
        peerBEditor.textContent(),
      ]);

      return peerAText === peerBText ? peerAText : null;
    })
    .not.toBeNull();
};

test.describe('yjs hocuspocus example', () => {
  test('owns transport lifetime while the binding preserves admitted offline work', async ({
    context,
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const peerBPage = await context.newPage();
    const peerBRuntimeErrors = recordBrowserRuntimeErrors(peerBPage);
    const room = `plite-yjs-hocuspocus-${randomUUID()}`;
    const peerAEditor = editor(page, 'a');
    const peerBEditor = editor(peerBPage, 'b');

    try {
      await Promise.all([
        page.goto(peerUrl(room, 'a')),
        peerBPage.goto(peerUrl(room, 'b')),
      ]);

      await expect(page.getByRole('heading', { name: 'Peer A' })).toBeVisible();
      await expect(
        peerBPage.getByRole('heading', { name: 'Peer B' })
      ).toBeVisible();
      await expect(admission(page)).toHaveAttribute(
        'data-admission-status',
        'waiting'
      );
      await expect(admission(peerBPage)).toHaveAttribute(
        'data-admission-status',
        'waiting'
      );
      await expect(peerAEditor).toHaveAttribute('aria-readonly', 'true');
      await expect(peerBEditor).toHaveAttribute('aria-readonly', 'true');
      await expect(peerAEditor).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByTestId('yjs-peer-a-append')).toBeDisabled();
      await expect(peerBPage.getByTestId('yjs-peer-b-append')).toBeDisabled();

      await peerAEditor.pressSequentially('discarded');
      await expect(peerAEditor).toHaveText('Hello world!');

      await Promise.all([
        connect(page, 'a').click(),
        connect(peerBPage, 'b').click(),
      ]);
      await expect(admission(page)).toHaveAttribute(
        'data-admission-status',
        'ready'
      );
      await expect(admission(peerBPage)).toHaveAttribute(
        'data-admission-status',
        'ready'
      );
      await expect(peerAEditor).not.toHaveAttribute('aria-readonly', 'true');
      await expect(peerBEditor).not.toHaveAttribute('aria-readonly', 'true');
      await expect(peerAEditor).toHaveText('Hello world!');
      await expect(peerBEditor).toHaveText('Hello world!');

      await Promise.all([
        page.getByTestId('yjs-peer-a-append').click(),
        peerBPage.getByTestId('yjs-peer-b-append').click(),
      ]);
      await expectConverged(peerAEditor, peerBEditor);

      await disconnect(peerBPage, 'b').click();
      await expect(
        peerBPage.getByText('disconnected', { exact: true })
      ).toBeVisible();
      await expect(admission(peerBPage)).toHaveAttribute(
        'data-admission-status',
        'ready'
      );
      await expect(peerBEditor).not.toHaveAttribute('aria-readonly', 'true');

      await peerBPage.getByTestId('yjs-peer-b-insert-text').click();
      await page.getByTestId('yjs-peer-a-append').click();
      await connect(peerBPage, 'b').click();
      await expectConverged(peerAEditor, peerBEditor);

      const beforeUndo = await peerAEditor.textContent();
      await page.getByTestId('yjs-peer-a-undo').click();
      await expectConverged(peerAEditor, peerBEditor);
      await expect(peerAEditor).not.toHaveText(beforeUndo ?? '');
      await page.getByTestId('yjs-peer-a-redo').click();
      await expectConverged(peerAEditor, peerBEditor);
      await expect(peerAEditor).toHaveText(beforeUndo ?? '');

      await peerBPage.goto('/examples/plite/plaintext');
      await expect(peerBPage.locator('[contenteditable="true"]')).toHaveCount(1);

      const freshRoom = `plite-yjs-hocuspocus-${randomUUID()}`;
      await peerBPage.goto(peerUrl(freshRoom, 'a'));
      await connect(peerBPage, 'a').click();
      await expect(admission(peerBPage)).toHaveAttribute(
        'data-admission-status',
        'ready'
      );
      await expect(editor(peerBPage, 'a')).toHaveText('Hello world!');

      runtimeErrors.assertNone();
      peerBRuntimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
      peerBRuntimeErrors.stop();
      await peerBPage.close().catch(() => undefined);
    }
  });
});
