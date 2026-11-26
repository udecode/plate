#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { rmSync } from 'node:fs';
import { signalProcesses, STOP_GRACE_MS } from './cross.mjs';

const [parent, group, seat, ...folders] = process.argv.slice(2);
const timer = setInterval(async () => {
  if (process.ppid === Number(parent)) return;
  clearInterval(timer);
  signalProcesses(Number(group), seat, 'SIGTERM');
  const deadline = Date.now() + STOP_GRACE_MS;
  while (signalProcesses(Number(group), seat, 0) && Date.now() < deadline) await new Promise((wake) => setTimeout(wake, 100));
  signalProcesses(Number(group), seat, 'SIGKILL');
  for (const folder of folders) rmSync(folder, { recursive: true, force: true });
}, 500);
