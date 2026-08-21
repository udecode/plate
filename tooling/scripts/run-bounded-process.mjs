import { spawn } from 'node:child_process';

const waitForExit = async (child, timeoutMs) => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return true;
  }

  let onExit;
  const exitPromise = new Promise((resolve) => {
    onExit = () => {
      resolve(true);
    };
    child.once('exit', onExit);
  });
  let timeout;
  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(false);
    }, timeoutMs);
  });
  const exited = await Promise.race([exitPromise, timeoutPromise]);

  clearTimeout(timeout);
  child.off('exit', onExit);

  return exited;
};

const signalProcessGroup = (child, pid, signal) => {
  try {
    if (process.platform !== 'win32' && pid) {
      process.kill(-pid, signal);
    } else if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  } catch (error) {
    if (error?.code === 'ESRCH') return;
    if (
      error?.code === 'EPERM' &&
      child.exitCode === null &&
      child.signalCode === null
    ) {
      child.kill(signal);
      return;
    }

    throw error;
  }
};

const processGroupIsAlive = (child, pid) => {
  try {
    if (process.platform !== 'win32' && pid) {
      process.kill(-pid, 0);
      return true;
    }

    return child.exitCode === null && child.signalCode === null;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    if (error?.code === 'EPERM') {
      return child.exitCode === null && child.signalCode === null;
    }
    throw error;
  }
};

export const stopProcessTree = async (
  child,
  signal = 'SIGTERM',
  gracePeriodMs = 5000
) => {
  if (!child) return;

  const pid = child.pid;

  signalProcessGroup(child, pid, signal);
  const exited = await waitForExit(child, gracePeriodMs);

  if (exited && !processGroupIsAlive(child, pid)) return;

  signalProcessGroup(child, pid, 'SIGKILL');
  if (!exited) await waitForExit(child, 1000);
};

export const runBoundedProcess = async ({
  args = [],
  captureLimitBytes = 64 * 1024 * 1024,
  command,
  cwd,
  echoOutput = false,
  env = process.env,
  gracePeriodMs = 5000,
  onProcessEnd,
  onProcessStart,
  shell = process.platform === 'win32',
  stdio = 'inherit',
  timeoutMs,
}) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('timeoutMs must be a positive number');
  }

  return new Promise((resolve, reject) => {
    const captured = { stderr: [], stdout: [] };
    const capturedBytes = { stderr: 0, stdout: 0 };
    let interruptedSignal;
    let processError;
    let terminationPromise;
    let timedOut = false;
    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== 'win32',
      env,
      shell,
      stdio,
    });

    onProcessStart?.(child);

    const beginTermination = (signal = 'SIGTERM') => {
      terminationPromise ??= stopProcessTree(child, signal, gracePeriodMs);

      return terminationPromise;
    };

    const signalHandlers = new Map(
      ['SIGINT', 'SIGTERM'].map((signal) => [
        signal,
        () => {
          interruptedSignal ??= signal;
          void beginTermination(signal).catch(reject);
        },
      ])
    );
    const cleanup = () => {
      clearTimeout(timeout);
      for (const [signal, handler] of signalHandlers) {
        process.off(signal, handler);
      }
      onProcessEnd?.(child);
    };
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;

      settled = true;
      cleanup();
      callback(value);
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      process.stderr.write(
        `Bounded subprocess exceeded ${timeoutMs}ms: ${command}\n`
      );
      void beginTermination().catch(reject);
    }, timeoutMs);

    const capture = (stream) => (chunk) => {
      if (echoOutput) process[stream].write(chunk);

      capturedBytes[stream] += chunk.byteLength;
      if (capturedBytes[stream] > captureLimitBytes) {
        processError ??= new Error(
          `${stream} exceeded ${captureLimitBytes} captured bytes`
        );
        void beginTermination().catch(reject);
        return;
      }
      captured[stream].push(chunk);
    };

    child.stdout?.on('data', capture('stdout'));
    child.stderr?.on('data', capture('stderr'));

    child.once('error', (error) => {
      settle(reject, error);
    });
    child.once('close', (status, signal) => {
      void (async () => {
        try {
          await terminationPromise;
          settle(resolve, {
            error: processError,
            signal: interruptedSignal ?? signal,
            status: timedOut
              ? 124
              : processError
                ? 1
                : interruptedSignal === 'SIGINT'
                  ? 130
                  : interruptedSignal === 'SIGTERM'
                    ? 143
                    : (status ?? 1),
            stderr: Buffer.concat(captured.stderr).toString('utf-8'),
            stdout: Buffer.concat(captured.stdout).toString('utf-8'),
            timedOut,
          });
        } catch (error) {
          settle(reject, error);
        }
      })();
    });
    for (const [signal, handler] of signalHandlers) {
      process.once(signal, handler);
    }
  });
};
