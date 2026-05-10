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
  - A completed shared state was ignored because a newer scoped state existed.
  - A session with `CODEX_THREAD_ID` but no scoped file fell through to another plan's pending `.tmp/completion-check.md`.
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
- `.tmp/completion-check.md` was already `done`, but the script skipped it.
- `.tmp/completion-check.md` belonged to another session and was `pending`, but a
  session with no scoped state still inherited that failure.
- Parallel planning sessions could block each other without sharing a goal.

## What Didn't Work

- Guessing the active plan from file modification time. A newer file only proves
  recent writes, not ownership by the current session.
- Storing more context in `.tmp/continue.md`. That file is also repo-global, so
  it cannot safely identify the current session when multiple sessions run.
- Falling back to `.tmp/completion-check.md` after seeing `CODEX_THREAD_ID` but
  not finding a matching scoped file. That makes the hook inherit another
  session's root state.
- Splitting session state across `.tmp/completion-checks/<id>.md` and
  `.tmp/continue/<id>.md`. It works, but it forces every workflow doc and
  operator to remember two unrelated path shapes for one session.

## Solution

Make scoped completion files opt-in and co-locate session artifacts:

- `.tmp/<session-id>/completion-check.md`
- `.tmp/<session-id>/continue.md`

The checker should read a scoped file when `COMPLETION_CHECK_ID`,
`CODEX_THREAD_ID`, `CODEX_SESSION_ID`, `--id`, or `--file` selects it. With no
selector, it may use `.tmp/completion-check.md` only when that shared state is
green or when no scoped state files exist. When an inherited session id has no
matching scoped file, it exits successfully with a skip message instead of
reading the shared root file. Legacy `.tmp/completion-checks/<id>.md` files can
remain readable as a compatibility fallback, but new state should use
`.tmp/<session-id>/completion-check.md`.

Cover the main scoped path:

```js
test('prefers a matching CODEX_THREAD_ID state over the shared fallback', async () => {
  await writeFile(path.join(cwd, '.tmp/completion-check.md'), 'status: pending\n');
  await mkdir(path.join(cwd, '.tmp/session-a'), { recursive: true });
  await writeFile(
    path.join(cwd, '.tmp/session-a/completion-check.md'),
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
  await writeFile(path.join(cwd, '.tmp/completion-check.md'), 'status: pending\n');

  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_THREAD_ID: 'missing-session' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /no state for session: missing-session/);
});
```

Keep the no-session fallback guard too:

```js
test('uses the shared state when hook env has no session id', async () => {
  await writeFile(path.join(cwd, '.tmp/completion-check.md'), 'status: done\n');
  await mkdir(path.join(cwd, '.tmp/other-session'), { recursive: true });
  await writeFile(
    path.join(cwd, '.tmp/other-session/completion-check.md'),
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

Then cover the Stop-hook shape where no session id is available and the shared
file is pending while scoped state files exist:

```js
test('skips a pending shared state when scoped states exist and no session id is available', async () => {
  await writeFile(path.join(cwd, '.tmp/completion-check.md'), 'status: pending\n');
  await mkdir(path.join(cwd, '.tmp/other-session'), { recursive: true });
  await writeFile(
    path.join(cwd, '.tmp/other-session/completion-check.md'),
    'status: pending\n'
  );

  const result = await runCompletionCheck({
    cwd,
    env: { CODEX_SESSION_ID: '', CODEX_THREAD_ID: '' },
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /scoped states exist/);
});
```

Update the generated skill rules at the same time so future `ralph` and
Ralplan prompts stop documenting newest-file fallback behavior and stop writing
the repo-global `.tmp/continue.md`.

Some Codex Desktop child processes expose `CODEX_THREAD_ID`, but Stop-hook
commands may only provide the session through hook JSON on stdin. Keep the UI
hook command pointed at the JSON-safe wrapper:

```sh
node tooling/scripts/completion-check-hook.mjs
```

The wrapper maps hook stdin `session_id` into `CODEX_THREAD_ID` when the env var
is absent, then runs `bun run completion-check`. The checker resolves that to
`.tmp/<CODEX_THREAD_ID>/completion-check.md` when the file exists. If the file
does not exist, the hook passes because this session has no active completion
gate. If no session id is visible and scoped state files exist, a pending root
state is also skipped because it is not safe to assign to the current session.
That gives each parallel session its own state and continuation prompt without
a repo-level multi-plan index.

When the state is pending, record the session continuation prompt in the state
file:

```md
status: pending
plan: docs/plans/current-plan.md
continue_file: .tmp/<session-id>/continue.md
```

The checker prints `continue_file` before failing so the Stop hook output points
at the prompt that belongs to the blocked session.

## Why This Works

A scoped plan id is authority. Modification time is not. The checker can still
block the correct scoped plan when an id is provided, but an unscoped Stop hook
no longer gets hijacked by unrelated active work.

`.tmp/continue.md` has the same ownership bug as root completion state. Moving
continuation prompts to `.tmp/<session-id>/continue.md` gives the checker and
human operator the same session key.

## Prevention

- Do not infer session ownership from file order.
- For parallel sessions, rely on inherited `CODEX_THREAD_ID`, hook stdin
  `session_id`, `COMPLETION_CHECK_ID=<session-id>`, or
  `bun run completion-check -- --id <session-id>`.
- Keep `.tmp/completion-check.md` as the unscoped fallback only for repo-level
  completion state when no scoped states exist, or when the shared state is
  already green.
- Do not write `.tmp/continue.md` or new `.tmp/continue/<id>.md` files; use
  `.tmp/<session-id>/continue.md` and record it as `continue_file` in the
  completion state.
- Add a regression whenever a workflow selector has both scoped and shared
  fallback behavior.

## Related Issues

- [Slate v2 deslop completion must prove sibling release discipline](2026-05-08-slate-v2-deslop-completion-must-prove-sibling-release-discipline.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](../developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
