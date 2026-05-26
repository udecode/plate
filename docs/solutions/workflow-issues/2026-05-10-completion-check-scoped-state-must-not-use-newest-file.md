---
title: Completion check scoped state must not use newest file
date: 2026-05-10
last_updated: 2026-05-10
category: docs/solutions/workflow-issues
module: plate-2 completion workflow
problem_type: workflow_issue
component: development_workflow
symptoms:
  - `bun run completion-check` failed on another session's pending scoped plan.
  - A session with `CODEX_THREAD_ID` but no scoped file fell through to another plan's pending state.
  - State and continuation prompts used different directory indexes.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [completion-check, scoped-state, parallel-sessions, stop-hook, continue-file]
---

# Completion check scoped state must not use newest file

## Problem

The completion checker supported scoped files, but the no-id fallback selected
the newest scoped file. That made one session's Stop hook fail because another
session had a newer pending plan.

## Symptoms

- `bun run completion-check` failed with another session's pending scoped file.
- A completed state was skipped because another session had a newer scoped file.
- Another session's scoped file was `pending`, and a session with no scoped
  state still inherited that failure.
- Parallel planning sessions could block each other without sharing a goal.

## What Didn't Work

- Guessing the active plan from file modification time. A newer file only proves
  recent writes, not ownership by the current session.
- Storing more context in `active goal state`. That file is repo-global, so it
  cannot safely identify the current session when multiple sessions run.
- Falling back to an unscoped state file after seeing `CODEX_THREAD_ID` but not
  finding a matching scoped file. That makes the hook inherit another session's
  state.
- Splitting session state across `.tmp/completion-checks/<id>.md` and
  `.tmp/continue/<id>.md`. It works, but it forces every workflow doc and
  operator to remember two unrelated path shapes for one session.

## Solution

Make scoped completion files opt-in and co-locate session artifacts:

- `active goal state`
- `active goal state`

The checker should read a scoped file when `COMPLETION_CHECK_ID`,
`CODEX_THREAD_ID`, `CODEX_SESSION_ID`, `--id`, or `--file` selects it. With no
selector, workflow docs and generated skills should create an explicit plan id
and use the same scoped layout. When an inherited session id has no matching
scoped file, the hook should exit successfully with a skip message instead of
reading another session's file. Legacy `.tmp/completion-checks/<id>.md` files
can remain readable as a compatibility fallback, but new state should use
`active goal state`.

Cover the main scoped path:

```js
test('prefers a matching CODEX_THREAD_ID state', async () => {
  await mkdir(path.join(cwd, '.tmp/session-a'), { recursive: true });
  await writeFile(
    path.join(cwd, 'active goal state'),
    'status: done\n'
  );

  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_THREAD_ID: 'session-a' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /tmp\/session-a\/completion-check\.md/);
});
```

The missing-session regression is the important guard:

```js
test('skips when the implicit session has no state file', async () => {
  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_THREAD_ID: 'missing-session' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /no state for session: missing-session/);
});
```

Keep the no-selector guard too:

```js
test('skips unselected scoped states when no session id is available', async () => {
  await mkdir(path.join(cwd, '.tmp/other-session'), { recursive: true });
  await writeFile(
    path.join(cwd, 'active goal state'),
    'status: pending\n'
  );

  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_SESSION_ID: '', CODEX_THREAD_ID: '' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /no session id/);
});
```

Update the generated skill rules at the same time so future `ralph` and
Ralplan prompts stop documenting newest-file fallback behavior and stop writing
the repo-global `active goal state`.

Some Codex Desktop child processes expose `CODEX_THREAD_ID`, but Stop-hook
commands may only provide the session through hook JSON on stdin. Keep the UI
hook command pointed at the JSON-safe wrapper:

```sh
node tooling/scripts/completion-check-hook.mjs
```

The wrapper maps hook stdin `session_id` into `CODEX_THREAD_ID` when the env var
is absent, then runs `bun run completion-check`. The checker resolves that to
`active goal state` when the file exists. If the file
does not exist, the hook passes because this session has no active completion
gate. If no session id is visible, workflow docs should create an explicit
completion id before starting a lane. That gives each parallel session its own
state and continuation prompt without a repo-level multi-plan index.

When the state is pending, record the session continuation prompt in the state
file:

```md
status: pending
plan: docs/plans/current-plan.md
continue_file: active goal state
```

The checker prints `continue_file` before failing so the Stop hook output points
at the prompt that belongs to the blocked session.

## Why This Works

A scoped plan id is authority. Modification time is not. The checker can still
block the correct scoped plan when an id is provided, but an unscoped Stop hook
no longer gets hijacked by unrelated active work.

`active goal state` has the same ownership bug as root completion state. Moving
continuation prompts to `active goal state` gives the checker and
human operator the same session key.

## Prevention

- Do not infer session ownership from file order.
- For parallel sessions, rely on inherited `CODEX_THREAD_ID`, hook stdin
  `session_id`, `COMPLETION_CHECK_ID=<session-id>`, or
  `bun run completion-check -- --id <session-id>`.
- Do not document an unscoped completion fallback. Use a session id or explicit
  plan id.
- Do not write `active goal state` or new `.tmp/continue/<id>.md` files; use
  `active goal state` and record it as `continue_file` in the
  completion state.
- Add a regression whenever a workflow selector has both scoped and shared
  fallback behavior.

## Related Issues

- [Slate v2 deslop completion must prove sibling release discipline](2026-05-08-slate-v2-deslop-completion-must-prove-sibling-release-discipline.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](../developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
