import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { desktopSessions } from './daily.mjs';

test('desktop session records become the scan session list, keyed by their worktree', () => {
  const root = mkdtempSync(join(tmpdir(), 'cleanup-daily-'));
  const dir = join(root, 'account', 'org');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'local_a.json'), JSON.stringify({ cwd: '/repo', worktreePath: '/repo/.claude/worktrees/a', isArchived: true, sessionId: 'local_a', title: 'A' }));
  writeFileSync(join(dir, 'local_b.json'), JSON.stringify({ cwd: '/repo', sessionId: 'local_b', title: 'B' }));
  writeFileSync(join(dir, 'local_bad.json'), '{');
  writeFileSync(join(dir, 'other.json'), JSON.stringify({ cwd: '/elsewhere' }));
  const sessions = desktopSessions(root).sort((a, b) => a.sessionId.localeCompare(b.sessionId));
  assert.deepEqual(sessions, [
    { cwd: '/repo/.claude/worktrees/a', isArchived: true, sessionId: 'local_a', title: 'A' },
    { cwd: '/repo', isArchived: false, sessionId: 'local_b', title: 'B' },
  ]);
});
