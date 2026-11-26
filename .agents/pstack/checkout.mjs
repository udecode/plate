// Installed by the sync-pstack skill.
// Finds the checkout a Claude Code hook's session works in. The desktop app
// sets CLAUDE_PROJECT_DIR, where the project's hooks start, to the main
// checkout even for a session in one of its worktrees, while the hook payload's
// cwd is the session's own directory. That cwd wins when it belongs to the
// same repository; a session whose cwd moved into another repository keeps the
// directory the hook started in.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

const locate = (dir) => {
  const run = spawnSync('git', ['-C', dir, 'rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'], { encoding: 'utf8' });
  const [root, common] = run.status === 0 ? run.stdout.trim().split('\n') : [];
  return root && common ? { root, common } : null;
};

export const hookPayload = () => {
  if (process.stdin.isTTY) return {};
  const raw = JSON.parse(readFileSync(0, 'utf8') || '{}');
  if (!raw || typeof raw !== 'object') return {};
  return {
    ...raw,
    session_id: raw.session_id ?? raw.conversationId ?? process.env.T3CODE_THREAD_ID,
    transcript_path: raw.transcript_path ?? raw.transcriptPath,
    hook_event_name: raw.hook_event_name ?? raw.hookEventName,
    last_user_input: raw.last_user_input ?? raw.lastUserInput,
    isAgy: Boolean(raw.hookEventName || raw.conversationId || raw.toolCall),
  };
};

export const sessionCheckout = (cwd) => {
  const here = locate('.');
  if (!here) return null;
  const there = typeof cwd === 'string' && existsSync(cwd) ? locate(cwd) : null;
  const { root, common } = there?.common === here.common ? there : here;
  return { root, main: basename(common) === '.git' ? dirname(common) : root };
};
