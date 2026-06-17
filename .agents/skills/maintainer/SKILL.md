---
description: Plate/Slate maintainer control plane for public GitHub issues, PRs, security queue, heartbeat scans, VISION fit, routing, authority boundaries, and proof-gated handoff.
argument-hint: '[heartbeat | issues | prs | security | queue | <issue-url|pr-url>] [--repo <owner/repo>]'
disable-model-invocation: true
name: maintainer
metadata:
  skiller:
    source: .agents/rules/maintainer.mdc
---

# Maintainer

Handle $ARGUMENTS.

Use this as the repo-local OpenClaw-style control plane for Plate and Slate
maintenance. It decides fit, priority, routing, authority, and proof. It does
not become the runtime execution skill unless no better owner exists.

This is the future automation entrypoint: a scheduler can run
`maintainer heartbeat`, and the skill will pick one safe item, route it, prove
it, or stop at the right authority boundary.

In this repo, maintainer automation runs through local Codex sessions in a
maintainer checkout. Do not assume hosted OpenClaw crabbox, background workers,
or API-run bots. Public issue and PR bodies must contain enough durable context
for a local maintainer session to reproduce, route, review, or stop cleanly.

## Standing Orders

These are the permanent operating orders for local maintainer automation. They
apply whenever the user invokes `maintainer heartbeat`, asks to maintain the
repo, or later wires a local scheduled Codex activation to this skill.

Scope:

- maintain the public Plate/Slate issue, PR, and security queue;
- improve public intake when issue/PR/security templates make local Codex work
  weaker than it should be;
- route one safe item per activation to the right owner;
- execute local docs/setup/proof repairs only when the owner is clear and the
  authority boundary allows it;
- run at most one internal `auto` fallback checkpoint only when no public
  queue item is safe and the invocation allows fallback.

Triggers:

- explicit user invocation: `maintainer`, `maintainer heartbeat`, `maintainer
  issues`, `maintainer prs`, `maintainer security`, or a public issue/PR URL;
- `auto` front-door handoff for public queue prompts, such as `auto PR #123`,
  `auto issue #123`, `auto all PRs`, `auto all issues`, `auto queue`, or
  `auto security`;
- future local scheduler invocation that runs a single Codex heartbeat;
- user asks for OpenClaw-like repo maintenance without choosing a narrower
  worker.

Allowed without asking:

- read public GitHub issue/PR/advisory state;
- read public intake docs, root `VISION.md`, relevant `docs/vision/*.md`, and
  owner skill rules;
- refresh the local queue ledger with
  `.agents/rules/maintainer/scripts/queue-snapshot.mjs` for broad queue or
  heartbeat work;
- build a candidate matrix and pick one item;
- classify invalid/support/noise/needs-repro/agent-ready state;
- run duplicate/claim guards through live GitHub and optional `gitcrawl`;
- route to a narrower owner skill;
- patch local docs, templates, plans, rules, or tests when the execution owner
  allows it and no public mutation is required;
- update local maintainer docs/rules/templates when a recurring workflow gap is
  proven;
- produce a decision-ready brief when authority or evidence is missing.
- write compact `docs/maintainer/runs/*` notes when a non-trivial heartbeat
  creates state future Codex sessions should not rediscover.

Approval gates:

- commit, branch, push, PR creation, merge, release, publish;
- GitHub comment, review submission, label, close, reopen, assignment, or
  milestone mutation;
- external sends/posts;
- security disclosure wording or public handling of an unpatched vulnerability;
- credentials, payment, 2FA, captcha, account signup, secrets, or private user
  data;
- destructive cleanup or irreversible repo action.

Escalate when:

- intake is too thin for local Codex to reproduce, route, or prove the item;
- VISION fit is unclear;
- duplicate/claim guard finds active ownership;
- proof requires unavailable credentials, devices, private accounts, or
  external services;
- the next useful action is a public mutation and the user did not authorize it;
- security scope is plausible but the report arrived publicly.

Every heartbeat follows Execute-Verify-Report:

1. execute the selected queue scan or route;
2. verify live state, owner, proof path, and authority boundary;
3. report selected item, rejected candidates, proof, mutations, changed files,
   attention items, and next heartbeat recommendation.

## Core Take

`maintainer` owns the public queue brain.

Execution owners still do the work:

- `resolve-slate-issue`: one Slate/Slate v2 GitHub issue, verified comment, and
  optional close.
- `clawsweeper`: Slate issue-ledger provenance, duplicate/stale/invalid
  classification, issue harvest discipline, and fork-local issue accounting.
- `issue-harvester`: exhaustive external issue-by-issue closure ledgers.
- `security-triage`: GHSA/CVE/advisory/security reports.
- `autoreview` / `resolve-pr-feedback`: PR review and review-comment closure.
- `autoclosure`: post-merge/current-tree until-clean closure for already
  applied work.
- `auto`: internal Plate/Slate quality, behavior, perf, API, proof, and
  workflow self-repair.
- `slate-plan` / `plate-plan`: architecture, public API, behavior law, and
  maintainer-objection plans.
- `architecture-cleanup`: repo-grounded architecture/code cleanup for
  cross-package refactors, testability gaps, shallow modules, over-splits,
  deslop, and agent-navigation friction before a plan or patch owner is chosen.
- `slate-research`: external OSS/GitHub discovery before local proof.
- `docs-creator`, `plate-plugin-creator`, `plate-ui`, and package owners:
  Plate docs/product/framework execution.

Do not bloat `auto` with public GitHub queue ownership. Do not use generic
`github-triage` as the repo brain when Plate/Slate routing matters; use it only
as a subordinate generic state-machine pattern when labels/comments are
explicitly requested.

## Use When

- The user invokes `maintainer`.
- `auto` routes a public GitHub issue, PR, security, queue, or heartbeat
  prompt here.
- The user asks to maintain the repo, scan issues, scan PRs, find agent-ready
  work, run a heartbeat, process a queue, triage public GitHub work, or route a
  public issue/PR/security report.
- The task starts from a Plate or Slate GitHub issue/PR and the user has not
  already chosen a narrower execution owner.
- The user wants OpenClaw-like loop automation without cloud crabbox/taskflow.
- The queue might span Slate substrate, Plate framework, docs, examples,
  registry, security, migration, PR review, and internal quality fallback.

## Do Not Use When

- The user explicitly invokes a narrower owner and the route is unambiguous.
- The task is post-merge/current-tree until-clean closure of already-applied
  work: use `autoclosure`.
- The task is an internal Plate/Slate quality/perf/browser/API loop with no
  public queue item: use `auto`.
- The task is one known Slate issue and the user wants it fixed/commented now:
  use `resolve-slate-issue` directly.
- The task is a local code patch with no maintainer queue decision: use `task`,
  `slate-patch`, `plate-plan`, or the package owner.
- The task asks for broad external research, not queue triage: use
  `slate-research`.

## Goal Contract

Use `autogoal` for non-trivial maintainer runs.

Goal handle shape:

```txt
Maintain <repo/scope>; done when queue item is routed, proved, or stopped with authority boundary; plan docs/plans/<path>.md.
```

Use the dedicated template:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template maintainer \
  --title "<repo or queue scope>"
```

The plan must record invocation mode, target repo, queue source, root
`VISION.md`, live GitHub state or auth blocker, archive/gitcrawl freshness when
used, duplicate/claim guard, candidate matrix, VISION fit, selected owner,
proof command or blocker, authority boundary, final handoff, and next heartbeat.

## Modes

### `heartbeat`

One local activation, not a daemon.

1. Read root `VISION.md`, then relevant `docs/vision/*.md`, then
   `docs/maintainer/standing-orders.md` and
   `docs/maintainer/heartbeat.md` when present.
2. Resolve repo. Default to `udecode/plate` after Slate v2 merges; use the URL
   repo or `--repo` when provided.
3. Refresh `docs/maintainer/queue.md` with:

   ```bash
   node .agents/rules/maintainer/scripts/queue-snapshot.mjs \
     --repo udecode/plate \
     --limit 20 \
     --out docs/maintainer/queue.md \
     --json .tmp/maintainer/queue-snapshot.json
   ```

   If `gh` auth/network is blocked, record the blocker and use the last queue
   ledger only as stale context.
4. Scan the smallest useful queue slice: security/advisories, PRs with
   review/CI/merge attention, issues needing triage, stale user-visible bugs,
   docs/setup breakage, then internal Slate quality fallback only if no public
   item is safe.
5. Build a candidate matrix.
6. Pick at most one autonomous item.
7. Route to the owner skill, execute the safe local slice, or stop with a
   compact decision-ready brief.
8. Write a compact `docs/maintainer/runs/*` note for non-trivial runs when it
   prevents duplicate work.
9. End with the heartbeat handoff: selected item, rejected candidates, live
   proof, authority boundary, public mutations, changed files, needs-user
   attention, and next heartbeat.

### `issues`

Scan issue queue. Use live `gh` for current state. Use `gitcrawl` only for
archive-first duplicate/neighbor discovery when fresh.

### `prs`

Scan PR queue. Read PR body, files, reviews, comments, checks, author, updated
time, linked issues, and current branch state before recommending review,
merge, close, or changes. Do not checkout/switch/merge unless the user
explicitly asks.

### `security`

Route to `security-triage` immediately. Security-shaped reports do not belong
in normal issue harvest or duplicate-close flow until the trust boundary is
classified.

### `<issue-url|pr-url>`

Read the exact item first. Then classify route:

| Item | Default owner |
| --- | --- |
| Slate substrate bug | `resolve-slate-issue` or `slate-patch` |
| Slate architecture/API fork | `slate-plan` |
| Already-applied PR/branch/current-tree closure | `autoclosure` |
| Plate/Slate internal quality/perf/browser gap | `auto` |
| Cross-package architecture/testability/refactor/deslop candidate | `architecture-cleanup`, then `major-task`, `slate-plan`, or `plate-plan` |
| Plate framework/plugin/component/docs | `plate-plan`, `plate-plugin-creator`, `plate-ui`, `docs-creator`, or `task` |
| Security/advisory | `security-triage` |
| PR review | `autoreview` |
| PR review feedback | `resolve-pr-feedback` |
| External corpus/issue ledger | `issue-harvester` or `clawsweeper` |
| Unclear prior art | `slate-research` |

## Read Order

1. Latest user request and any issue/PR/advisory URL.
2. Active goal plan when one exists.
3. Root `VISION.md`.
4. Relevant detail file:
   - `docs/vision/common.md` for maintainer/automation/security/proof policy;
   - `docs/vision/slate.md` for Slate substrate;
   - `docs/vision/plate.md` for Plate framework/product/docs;
   - `docs/vision/sync.md` only for doctrine sync.
5. `.agents/AGENTS.md` for repo command/authority policy.
6. Public intake docs when they apply:
   - `CONTRIBUTING.md`;
   - `.github/PULL_REQUEST_TEMPLATE.md` for PR work;
   - `.github/ISSUE_TEMPLATE/*.yml` for issue work;
   - `SECURITY.md` for security-shaped work.
7. `docs/maintainer/queue.md` and `.tmp/maintainer/queue-snapshot.json` when
   the invocation is heartbeat or broad queue work.
8. Issue/PR/advisory live state through `gh` or the connected GitHub tool.
9. `gitcrawl` archive/cluster/neighbor data when it can reduce duplicates.
10. Current source/tests/docs for the claimed owner.
11. Owner skill source rule before delegating.

## Local Codex Maintainer Model

- Treat public issue and PR text as the durable handoff for a local Codex run.
- Do not rely on private chat context, a hosted API worker, cloud daemon state,
  crabbox, or background automations to fill missing repro/proof/risk details.
- If intake is incomplete, ask for the smallest missing public evidence or mark
  the item `needs reproduction` / brief-only instead of pretending it is
  agent-ready.
- Prefer PR bodies that name intent, linked context, real behavior proof,
  focused commands, owner surface, risk, current blocker, and next action.
- Public security reports route privately first. Do not process a public issue
  as normal queue work when it discloses an unpatched vulnerability.

## Live State And Archive Use

Live GitHub is final truth for current state, comments, labels, reviews,
assignees, linked PRs, checks, mergeability, closure, and user authority.

Use `gitcrawl` only as discovery:

```bash
gitcrawl doctor --json
gitcrawl threads <owner/repo> --numbers <n> --include-closed --json
gitcrawl neighbors <owner/repo> --number <n> --limit 20 --json
gitcrawl search issues "<query>" -R <owner/repo> --state all --json number,title,state,url,updatedAt,labels --limit 50
gitcrawl clusters-report <owner/repo> --sort size --min-size 3 --limit 20 --member-limit 12 --body-chars 280
```

Before any comment, label, close, reopen, merge, review, branch, PR, or commit,
re-read live GitHub and local source proof. Similarity is not permission to
mutate.

## Candidate Matrix

For every candidate considered, record compact rows:

- number / URL;
- title;
- source: issue, PR, advisory, queue scan, gitcrawl cluster, user prompt;
- current live state and updated date;
- queue snapshot source and freshness when applicable;
- category: Slate, Plate, docs, security, PR review, external corpus, internal
  quality, support/noise;
- VISION fit: yes, no, unclear;
- duplicate/claim guard;
- recommended owner;
- smallest proof command or proof blocker;
- authority needed;
- decision: route, brief-only, skip, defer, or blocked.

Do not pad the queue with weak candidates. If no item is safe, say no item is
safe and run one internal-quality fallback only when the invocation allows it.

## Fit Gate

Before routing as autonomous, the item must pass:

- fits root `VISION.md` and relevant detail doctrine;
- has a current live source;
- has no active owner/PR/branch/recent claim conflict;
- has a clear owner skill/package/docs surface;
- has an honest proof path;
- has enough public intake context for a local maintainer Codex run, or the
  missing context is explicitly requested;
- does not require external credentials, destructive action, or public mutation
  without explicit user authority;
- does not rely on title-only or AI-only evidence.

When fit is unclear, produce a decision-ready brief instead of guessing.

## Authority Boundaries

Default is read, classify, route, patch local files when execution owner allows,
and hand off. Do not mutate GitHub or release state unless the user explicitly
asks or the invoked owner skill explicitly requires it.

Hard stops:

- commit, push, PR creation, branch creation, merge, close, label, reopen,
  comment, review submission, release, publish;
- external sends/posts;
- credentials, payment, 2FA, captcha, account signup, or secret handling;
- security disclosure wording that needs maintainer approval;
- destructive cleanup or irreversible repo action.

If the user explicitly asked for one of these, perform it through the correct
owner and record proof.

## Fallback Ladder

When no public queue item is safe:

1. security/doc/PR blockers with clear proof;
2. stale issue duplicate/claim guard repair;
3. issue brief improvements;
4. docs/setup source-backed improvements;
5. source-backed architecture/code cleanup through `architecture-cleanup` only
   when a public item or repeated queue friction proves the need;
6. `autoclosure` one current-tree closure pass when already-applied work is the
   best fallback;
7. `auto` one internal quality checkpoint;
8. `sync-vision` if repeated user/agent corrections are uncaptured;
9. `openclaw-sync` when the requested task is specifically to refresh upstream
   agent setup.

Do not run broad internal automation as a substitute for a public queue item
when the user asked for issue/PR maintenance and a public blocker remains.

## Final Handoff

Report repo/mode, queue snapshot path and freshness, queue slice inspected,
selected item and owner, candidate matrix summary, live GitHub proof or auth
blocker, duplicate/claim guard, execution/proof commands, public mutations,
changed list, run artifact, needs-user-attention, and next heartbeat
recommendation.

Keep it short. The maintainer should be able to approve the next action without
reading raw diffs or raw issue dumps.
