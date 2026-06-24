# Maintainer Standing Orders

These standing orders define what local Codex may do when it is maintaining
Plate/Plite.

They adapt the OpenClaw standing-order pattern to this repo. The important
difference: maintenance runs in local Codex sessions inside a maintainer
checkout. There is no hosted bot, no API worker, no crabbox daemon, and no
background cloud automation unless that is explicitly built later.

## Program

**Authority:** maintain public Plate/Plite issue, PR, and security queue health;
route one safe item per activation; improve local intake/proof workflow when it
is clearly weak.

**Trigger:** explicit `maintainer` invocation, `maintainer heartbeat`, broad
repo-maintenance prompts, or a future local scheduled Codex activation.

**Primary owner:** `$maintainer`.

**Execution owners:** `$task`, `$resolve-slate-issue`, `$slate-auto`,
`$security-triage`, `$autoreview`, `$resolve-pr-feedback`, `$docs-creator`,
`$plate-plan`, `$slate-plan`, `$issue-harvester`, and other narrower owners.

## Allowed Without Asking

- Read public GitHub issues, PRs, advisories, reviews, comments, checks, and
  labels.
- Read root `VISION.md`, `docs/vision/*.md`, public intake docs, and owner
  skills.
- Refresh `docs/maintainer/queue.md` with the queue snapshot script when the
  invocation is broad queue or heartbeat work.
- Build a candidate matrix and pick one item.
- Run duplicate/claim guards.
- Classify issues as agent-ready, needs-repro, support/noise, duplicate,
  security-shaped, Plate-owned, Plite-owned, or deferred.
- Route to the correct owner skill.
- Patch local docs, templates, skills/rules, tests, or source when the selected
  owner permits local execution and no public mutation is required.
- Repair public intake docs when recurring reports or PRs are too weak for local
  Codex to act on.
- Produce a decision-ready brief when evidence or authority is missing.
- Run one internal `plite-auto` quality fallback only when no public queue item
  is safe and the invocation allows fallback.
- Write a compact `docs/maintainer/runs/*` note when it prevents duplicate
  future work.

## Approval Gates

Stop for explicit user authority before:

- commit, branch, push, PR creation, merge, release, or publish;
- GitHub comment, review submission, label, close, reopen, assignment, or
  milestone change;
- public security disclosure wording or handling of an unpatched vulnerability;
- external sends/posts;
- credentials, payment, 2FA, captcha, account signup, secrets, or private user
  data;
- destructive cleanup or irreversible repo action.

## Escalation

Escalate instead of guessing when:

- public intake is too thin for a local Codex run to reproduce, route, or prove;
- VISION fit is unclear;
- duplicate/claim guard finds an active owner, PR, branch, or recent claim;
- proof needs unavailable credentials, devices, private accounts, or external
  services;
- the next useful action is a public mutation without authority;
- a public issue or PR discloses a plausible unpatched vulnerability.

## Execute-Verify-Report

Every maintainer activation follows this loop:

1. **Execute:** scan the smallest useful queue slice and pick at most one item.
2. **Verify:** read live state, intake, duplicate/claim guard, owner, proof path,
   and authority boundary.
3. **Report:** selected item, rejected candidates, proof, public mutations,
   changed files, needs-attention items, queue/run artifacts, and next
   heartbeat.

"I would do X" is not a heartbeat. Either route, execute the safe local slice,
or explain the exact blocker.

## Non-Goals

- No CODEOWNERS.
- No hosted/API bot assumption.
- No crabbox/cloud daemon model.
- No release automation unless the user asks for release work.
- No Discord/Telegram/channel plumbing.
- No broad internal automation as a dodge when a public queue item is blocked.
