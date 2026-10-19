import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runBoundedProcess } from './run-bounded-process.mjs';

const waitUntil = async (predicate, timeoutMs = 1000) => {
  const startedAt = performance.now();

  while (performance.now() - startedAt < timeoutMs) {
    if (predicate()) return true;
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }

  return false;
};

const processIsAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    throw error;
  }
};

test(
  'times out and terminates the complete detached subprocess tree',
  {
    skip: process.platform === 'win32',
  },
  async () => {
    const temporaryRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'plite-bounded-process-')
    );
    const pidFile = path.join(temporaryRoot, 'grandchild.pid');
    const heartbeatFile = path.join(temporaryRoot, 'heartbeat');
    const grandchildSource =
      "const fs=require('node:fs');const file=process.argv[1];" +
      "process.on('SIGTERM',()=>{});" +
      "setInterval(()=>fs.appendFileSync(file,'x'),10);";
    const wrapperSource =
      "const {spawn}=require('node:child_process');const fs=require('node:fs');" +
      "const child=spawn(process.execPath,['-e',process.argv[1],process.argv[3]],{stdio:'ignore'});" +
      'fs.writeFileSync(process.argv[2],String(child.pid));setInterval(()=>{},1000);';

    try {
      const result = await runBoundedProcess({
        args: ['-e', wrapperSource, grandchildSource, pidFile, heartbeatFile],
        command: process.execPath,
        cwd: temporaryRoot,
        gracePeriodMs: 100,
        stdio: 'ignore',
        timeoutMs: 150,
      });
      const grandchildPid = Number(fs.readFileSync(pidFile, 'utf-8'));

      assert.equal(result.timedOut, true);
      assert.equal(result.status, 124);
      assert.equal(
        await waitUntil(() => !processIsAlive(grandchildPid)),
        true,
        `grandchild ${grandchildPid} survived the process-tree timeout`
      );
    } finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true });
    }
  }
);
