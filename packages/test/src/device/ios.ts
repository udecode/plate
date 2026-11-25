import { spawn } from 'node:child_process';
import { closeSync, openSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export type RunnerCommand =
  | { action: 'activate' }
  | {
      action: 'drag';
      holdMs: number;
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    }
  | { action: 'key'; label: string }
  | { action: 'keyboard' }
  | { action: 'press'; ms: number; x: number; y: number }
  | { action: 'tap'; x: number; y: number };

export type RunnerReply = {
  error?: string;
  keys?: string[];
  ok: boolean;
  shown?: boolean;
};

export type IosRunner = {
  send: (command: RunnerCommand) => Promise<RunnerReply>;
  stop: () => Promise<void>;
};

export const startIosRunner = async ({
  log,
  udid,
  xctestrun,
}: {
  log: string;
  udid: string;
  xctestrun: string;
}): Promise<IosRunner> => {
  let parkedPoll: ServerResponse | null = null;
  let inFlight: {
    reject: (error: Error) => void;
    resolve: (reply: RunnerReply) => void;
  } | null = null;
  let markReady = () => {};
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });

  const server = createServer((request, response) => {
    let body = '';

    request
      .on('data', (chunk) => {
        body += chunk;
      })
      .on('end', () => {
        const reply = JSON.parse(body) as RunnerReply & { ready?: boolean };

        parkedPoll = response;
        if (reply.ready) {
          markReady();
        } else {
          inFlight?.resolve(reply);
          inFlight = null;
        }
      });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address() as AddressInfo;
  const output = openSync(log, 'a');
  const runner = spawn(
    'xcodebuild',
    [
      'test-without-building',
      '-xctestrun',
      xctestrun,
      '-destination',
      `id=${udid}`,
    ],
    {
      env: {
        ...process.env,
        TEST_RUNNER_PLATE_DRIVE_URL: `http://127.0.0.1:${port}/next`,
      },
      stdio: ['ignore', output, output],
    }
  );

  closeSync(output);
  const exited = new Promise<number | null>((resolve) => {
    runner.once('exit', resolve);
  });

  void exited.then((code) => {
    inFlight?.reject(
      new Error(`The iOS runner exited with ${code}; see ${log}`)
    );
    inFlight = null;
    server.close();
  });

  const start = await Promise.race([
    ready.then(() => 'ready' as const),
    exited.then(() => 'exited' as const),
    new Promise<'timeout'>((resolve) => {
      setTimeout(() => resolve('timeout'), 180_000).unref();
    }),
  ]);

  if (start !== 'ready') {
    runner.kill();
    throw new Error(`The iOS runner did not start (${start}); see ${log}`);
  }

  let queue = Promise.resolve();

  const send = (command: RunnerCommand) => {
    const reply = queue.then(
      () =>
        new Promise<RunnerReply>((resolve, reject) => {
          if (!parkedPoll) {
            throw new Error('The iOS runner has no poll waiting for a command');
          }
          inFlight = { reject, resolve };
          parkedPoll.end(JSON.stringify(command));
          parkedPoll = null;
        })
    );

    queue = reply.then(
      () => {},
      () => {}
    );

    return reply;
  };

  return {
    send,
    stop: async () => {
      await queue;
      parkedPoll?.end(JSON.stringify({ action: 'stop' }));
      parkedPoll = null;
      await Promise.race([
        exited,
        new Promise((resolve) => {
          setTimeout(resolve, 30_000).unref();
        }),
      ]);
      runner.kill();
    },
  };
};
