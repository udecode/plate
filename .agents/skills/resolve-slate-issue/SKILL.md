---
description: Resolve one Slate or Slate v2 GitHub issue end to end, using task-style issue intake plus Slate Ralplan proof discipline, then post the verified no-PR issue comment with gh.
argument-hint: <issue number | issue URL>
disable-model-invocation: true
name: resolve-slate-issue
metadata:
  skiller:
    source: .agents/rules/resolve-slate-issue.mdc
---

# Resolve Slate Issue

Handle $ARGUMENTS.

Use this for one issue at a time when the goal is to prove, fix or classify the
issue, then comment directly on the issue. This combines `task` issue-first
execution with Slate Ralplan's live-source, issue-ledger, and Slate v2
verification discipline.

## Hard Rules

- Do not open, create, update, or mention a PR.
- Do not include PR metadata lines in the GitHub issue comment.
- Do not include a `Fixes ...` issue metadata line in the comment.
- Do not comment until the outcome is verified or intentionally classified as
  already fixed/currently accounted.
- Use `gh issue comment ... --body-file ...` for the final issue comment.
- If confidence is `95%+` after verification, close the issue after posting the
  comment.
- If the required flow cannot be tested honestly, do not close the issue; ask a
  human to reproduce the exact flow and report back.
- Start from the issue source, not from old plans or memory.
- Current `../slate-v2` source wins over issue-time assumptions.
- An issue may name an origin commit. Treat that commit as the report baseline,
  not current truth. Later commits may already have fixed it.
- If current `../slate-v2` is already green for the issue flow, do not patch
  code just to make a diff. Classify `already-accounted`, record evidence, and
  comment with current verification.
- If current `../slate-v2` is red, add the smallest proof row first, fix the
  real owner, then verify.
- Do not claim manual IME/mobile/device closure from synthetic browser rows.
- `plate-2` commands prove planning/docs state only. Slate behavior proof must
  run in `/Users/zbeyens/git/slate-v2`.

## Intake

1. Resolve the issue:

```bash
gh issue view <number-or-url> -R udecode/slate --comments --json number,title,body,comments,labels,state,url
```

If the repo is not `udecode/slate`, resolve the repo from the URL or current
`gh` repo, then fetch the same fields.

2. Read the issue body, comments, labels, attached images, and attached videos.
3. If a video or screen recording exists, use `video-transcripts` before
   implementation unless an existing cached transcript comment fully covers the
   same normalized media URL.
4. Extract:
   - issue number and title
   - exact user flow
   - expected behavior
   - actual behavior
   - local route or package owner
   - live reference route when present
   - origin commit or branch if present
   - likely owner in `../slate-v2`
   - browser/device requirement

## Current-State Check

Before editing:

1. Inspect current `../slate-v2` source, examples, tests, and routes that own
   the issue.
2. If the issue names an origin commit, optionally compare that baseline to
   current HEAD when it helps explain why the issue is already fixed. Do not
   check out old commits unless needed for proof.
3. Reproduce against current `../slate-v2` first.
4. Classify current state:

| State | Meaning | Action |
| --- | --- | --- |
| `red-current` | Current `../slate-v2` still reproduces the issue. | Add proof row, fix, verify, then comment. |
| `already-accounted` | Current `../slate-v2` passes the issue flow, likely fixed by later commits or prior work. | No code change; verify, comment, close if confidence is `95%+`. |
| `needs-manual-proof` | Browser/device/IME proof cannot be honestly automated. | Run available supporting proof, ask a human to reproduce the exact flow, leave open, and do not overclaim. |
| `blocked` | Required issue evidence, media, or tooling is inaccessible after a real attempt. | Do not comment as fixed. Report blocker. |

## Execution

For `red-current`:

1. Add the smallest failing proof:
   - package test for model/history/clipboard contracts;
   - Playwright row for browser behavior;
   - manual/browser note only when automation cannot honestly cover it.
2. Fix the durable owner in `../slate-v2`.
3. Avoid example-local patches unless the bug is truly example-local.
4. Run focused verification from `/Users/zbeyens/git/slate-v2`.
5. Run broader Slate v2 gate when the touched surface justifies it.
6. Update any local plan or fork dossier only when useful for issue accounting.
7. If verification gives `95%+` confidence, close the issue after posting the
   comment:

```bash
gh issue close <number-or-url> -R udecode/slate
```

For `already-accounted`:

1. Keep code unchanged.
2. Add missing proof only if the issue flow is important and uncovered.
3. Verify the current behavior with the smallest honest command or browser
   flow.
4. Comment as current verified behavior, not as a new fix.
5. If confidence is `95%+`, close the issue after posting the comment.

For `needs-manual-proof`:

1. Run any supporting automated proof that is honest for the flow.
2. Comment with the exact human reproduction request.
3. Leave the issue open.
4. Do not use the `95-100%` confidence line.

## Verification

Record exact commands with cwd.

Common Slate v2 gates:

```bash
cd /Users/zbeyens/git/slate-v2
bun --filter slate-react typecheck
bun check
PLAYWRIGHT_BASE_URL=http://localhost:3100 bun playwright <test-file> --project=chromium --grep "<issue row>"
```

Use only the commands that fit the touched surface. If `bun check` fails for an
unrelated broad integration or local-environment reason, isolate the failure and
record why it does not block the issue comment.

## Comment Body

Write the final comment to a temp file, then post it:

```bash
gh issue comment <number-or-url> -R udecode/slate --body-file <comment-file>
```

Use this format. Keep it concise. Omit `**⚠️ Caveat**` when there is no real
caveat.

```md
🟢 95-100% confidence

| Phase | 🧪 Tests | 🌐 Browser |
| --- | --- | --- |
| Reproduced | 🔴 <failing proof or issue-current repro> | ✅ <browser/local repro> |
| Verified | 🟢 <passing proof> | ✅ <browser verified behavior> |

**🌐 Browser Check**

- Open `<exact route>`.
- Follow `<exact user flow>`.
- Confirm `<expected fixed/current behavior>`.

**✅ Outcome**

- <What now happens for the user.>
- <What no longer happens.>

**⚠️ Caveat**

- <Only real caveats: manual IME/device gap, already fixed by later commits, or partial browser coverage.>

**🏗️ Design**

- Chosen owner: <runtime/package/example owner>.
- Why not quick patch: <why a local workaround was wrong, or `N/A; already fixed in current v2`.>
- Why not broader change: <why a larger API/runtime change was unnecessary, if applicable.>

**🧪 Verified**

- `<command or browser proof>`
- `<command or browser proof>`
```

Status words:

- Use `🔴` only when a real failing proof was observed in this run or preserved
  from the just-executed plan.
- Use `✅` when evidence exists but the current checkout was already green.
- For `already-accounted`, say that plainly in `Outcome` or `Caveat`; do not
  fake red-green.
- Keep confidence below `95%` if browser/device proof is partial or manual-only.
- Close the issue only when the confidence line is `🟢 95-100% confidence`.
- When the required browser/device flow cannot be tested, include a caveat like:
  `Please reproduce the steps above on <browser/device/input method>; leave this
  open until that confirms the behavior.`

## Final Handoff

After commenting, answer with:

- issue number
- classification: `red-current -> fixed`, `already-accounted`, or blocker
- comment posted: URL if `gh` returns one
- issue closed: yes/no, with reason
- verification commands
- any caveat

Keep it short.
