---
title: Completion check scoped state must not use newest file
date: 2026-05-10
category: docs/solutions/workflow-issues
module: plate-2 completion workflow
problem_type: workflow_issue
component: development_workflow
symptoms:
  - `bun run completion-check` failed on another session's pending scoped plan.
  - A completed shared state was ignored because a newer file existed under `tmp/completion-checks/`.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [completion-check, scoped-state, parallel-sessions, stop-hook]
---

# Completion check scoped state must not use newest file

## Problem

The completion checker supported scoped files under `tmp/completion-checks/`,
but the no-id fallback selected the newest scoped file. That made one session's
Stop hook fail because another session had a newer pending plan.

## Symptoms

- `bun run completion-check` failed with a pending file under
  `tmp/completion-checks/`.
- `tmp/completion-check.md` was already `done`, but the script skipped it.
- Parallel planning sessions could block each other without sharing a goal.

## What Didn't Work

- Guessing the active plan from file modification time. A newer file only proves
  recent writes, not ownership by the current session.
- Storing more context in `tmp/continue.md`. That file is also repo-global, so
  it cannot safely identify the current session when multiple sessions run.

## Solution

Make scoped completion files opt-in. The checker should read a scoped file when
`COMPLETION_CHECK_ID`, `CODEX_THREAD_ID`, `CODEX_SESSION_ID`, `--id`, or
`--file` selects it. With no selector, or when an inherited session id has no
matching scoped file, it falls back to `tmp/completion-check.md`.

The regression test is the important guard:

```js
test('uses the shared state when hook env has no session id', async () => {
  await writeFile(path.join(cwd, 'tmp/completion-check.md'), 'status: done\n');
  await writeFile(
    path.join(cwd, 'tmp/completion-checks/other-session.md'),
    'status: pending\n'
  );

  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_SESSION_ID: '', CODEX_THREAD_ID: '' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /tmp\/completion-check\.md/);
});
```

Update the generated skill rules at the same time so future `ralph` and
Ralplan prompts stop documenting newest-file fallback behavior.

Codex Desktop exposes `CODEX_THREAD_ID` to child processes, so the immutable
hook can stay plain:

```sh
bun run completion-check
```

The script resolves that to `tmp/completion-checks/<CODEX_THREAD_ID>.md` when
the file exists. That gives each parallel session its own state file without a
repo-level multi-plan index.

## Why This Works

A scoped plan id is authority. Modification time is not. The checker can still
block the correct scoped plan when an id is provided, but an unscoped Stop hook
no longer gets hijacked by unrelated active work.

## Prevention

- Do not infer session ownership from file order under `tmp/completion-checks/`.
- For parallel sessions, rely on inherited `CODEX_THREAD_ID` when available,
  pass `COMPLETION_CHECK_ID=<session-id>`, or run
  `bun run completion-check -- --file tmp/completion-checks/<session-id>.md`.
- Keep `tmp/completion-check.md` as the unscoped fallback for repo-level
  completion state.
- Add a regression whenever a workflow selector has both scoped and shared
  fallback behavior.

## Related Issues

- [Slate v2 deslop completion must prove sibling release discipline](2026-05-08-slate-v2-deslop-completion-must-prove-sibling-release-discipline.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](../developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
