#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hookPayload } from '../../.agents/pstack/checkout.mjs';
import { ledgerPath, readTasks } from '../../.agents/pstack/tasks.mjs';

const BRANCH = 'origin/next';
const SCRIPT = fileURLToPath(new URL('relapse.mjs', import.meta.url));
const SCRIPT_TIMEOUT_MS = 25_000;

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

function main() {
  const input = hookPayload();
  const isAgy = Boolean(input.isAgy);
  const done = () => {
    if (isAgy) process.stdout.write('{}');
  };
  const stopActive =
    input.stop_hook_active ||
    (isAgy && (input.continuationActive || Number(input.executionNum) > 0));
  // Codex sets CODEX_SESSION_ID only in its shell commands, so a Codex hook's
  // environment holds only ids inherited from a parent session, and only the
  // payload names this one.
  const session = process.argv.includes('--codex')
    ? input.session_id
    : isAgy
      ? process.env.T3CODE_THREAD_ID || input.session_id
      : process.env.CLAUDE_CODE_HOST_SESSION_ID ||
        process.env.CLAUDE_CODE_SESSION_ID ||
        input.session_id;
  if (
    process.env.PSTACK_READ_ONLY ||
    stopActive ||
    input.background_tasks?.length ||
    input.session_crons?.length ||
    (isAgy && input.fullyIdle === false) ||
    !session
  ) {
    done();
    return;
  }

  const common = git('rev-parse', '--path-format=absolute', '--git-common-dir');
  const checked = path.join(common, 'relapse-checked');
  const landed = git(
    'log',
    BRANCH,
    '--no-merges',
    '--since-as-filter=2.weeks.ago',
    '--fixed-strings',
    `--grep=Session: ${session}`,
    '--format=%H'
  )
    .split('\n')
    .filter((sha) => sha && !existsSync(path.join(checked, sha)));
  if (!landed.length) {
    done();
    return;
  }

  const report = execFileSync(
    'node',
    [SCRIPT, ...landed.flatMap((sha) => ['--fix', sha])],
    {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: SCRIPT_TIMEOUT_MS,
    }
  );
  mkdirSync(checked, { recursive: true });
  for (const sha of landed) writeFileSync(path.join(checked, sha), '');

  const root = git('rev-parse', '--show-toplevel');
  const config = JSON.parse(
    readFileSync(path.join(root, '.agents/pstack.json'), 'utf-8')
  );
  const ledger = path.join(
    path.dirname(common),
    ledgerPath(config.plans, config.delivery)
  );
  const open = new Set(
    [
      ...readTasks(
        (existsSync(ledger) ? readFileSync(ledger, 'utf-8') : '')
          .split('\n')
          .slice(1)
      ).values(),
    ]
      .filter((task) => ['offered', 'started'].includes(task.status))
      .map((task) => task.topic)
  );
  const cards = [...report.matchAll(/^== card (\S+):/gm)]
    .map((match) => match[1])
    .filter((id) => !open.has(`review-${id}`));
  if (!cards.length) {
    done();
    return;
  }

  process.stdout.write(
    JSON.stringify({
      decision: isAgy ? 'continue' : 'block',
      reason: `This session landed fixes that rework recent fixes in ${cards.join(', ')}, whose fixes keep coming back two weeks running. Run step 2 of the Verdict playbook's Relapse pass for ${cards.length === 1 ? 'that scope' : 'each of those scopes'} from the report below, as the pass's fix-time check says, then the chips skill's Close, and say so in one line.\n\n${report}`,
    })
  );
}

try {
  main();
} catch (error) {
  console.error(`relapse-due: ${error.stderr || error.message}`);
  process.exitCode = 1;
}
