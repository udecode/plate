---
description: Handle public Plate/Slate GitHub work, such as issue drafts, Slate issues, PRs, security and the queue scan, and hold the public truth gate. Triage of udecode/plate and udecode/plate-private issues runs the Triage playbook.
argument-hint: '[queue | issues | prs | security | issue-draft | slate-issue] <url or text>'
name: maintainer
metadata:
  skiller:
    source: .agents/rules/maintainer.mdc
---

# Maintainer

Handle $ARGUMENTS.

Use `maintainer` for public GitHub work: repo maintenance, PR and security scans, Slate issues, issue drafts, and public PRs or Slate issues without a chosen owner. Triage of `udecode/plate` and `udecode/plate-private` issues, their records on `refs/triage/state`, and their fix runs belong to the [Triage playbook](../../playbooks/triage.md). Narrower user-named owners, internal benchmark/quality loops, and broad research go to their own owners; never hand public queue ownership to an internal quality run.

Maintenance runs in local maintainer sessions, never a hosted bot, cloud worker, or daemon, and never mutates GitHub without explicit authority. Read public intake contracts first (`CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*.yml`, `SECURITY.md`). An item lacking public reproduction, proof, risk, owner, blocker, and next action is not agent-ready: ask for the smallest missing evidence or keep it brief-only. A run finishes when its item is routed, proved, or stopped at its authority boundary.

## Modes

### `issue-draft <video or text>`

Draft a Plate Beta issue from video or text with exact reproduction and media, and publish only when asked. Read [issue draft method](./references/issue-draft.md) in full; it drives this skill's `scripts/` and `assets/`.

### `slate-issue <issue>`

Read [Slate issue recipe](./references/slate-issue.md) in full. It owns intake and public claim accounting; pstack's Bug fix playbook owns local repair. Execute public steps only under active authority.

### `queue`

Broad scan for "queue", "all issues", "all PRs", or repo maintenance:

1. Read live queues (stop and record blocker if `gh` auth or network fails; keep advisory details out of replies and versioned files):

   ```bash
   gh api repos/udecode/plate/security-advisories --jq '.[] | select(.state == "triage" or .state == "draft") | {ghsa_id, state, severity}'
   gh pr list --repo udecode/plate --state open --json number,title,author,baseRefName,isDraft,reviewDecision,mergeStateStatus,updatedAt
   ```

2. Scan the smallest useful slice: advisories, PRs needing review/CI/merge attention, issues needing triage, stale user-visible bugs, then docs or setup breakage.
3. Pull issue picks from `pnpm triage queue` (`udecode/plate`) and `pnpm triage queue --repo plate-private` (`udecode/plate-private`), and Slate issues from `gh issue list --repo ianstormtaylor/slate`. Build the candidate matrix for PRs, advisories, and Slate items, pick at most one safe item, verify live state and authority, then route it, run its safe local slice, or stop with a decision-ready brief.
4. Write a compact `docs/maintainer/runs/*` note only when it saves durable state for later sessions.

### `issues`

Run the [Triage playbook](../../playbooks/triage.md) over open `udecode/plate` and `udecode/plate-private` issues (or one named issue). Its duplicate rule, `gitcrawl` neighbor search, and Fit Gate also govern Slate issues via [slate-issue](./references/slate-issue.md) without a register row.

### `prs`

Scan the PR queue. Read body, files, reviews, comments, checks, author, updated time, linked issues, and branch state before recommending review, merge, close, or changes.

### `security`

Read [security hotfix mechanics](./references/security-hotfix.md) when work includes an advisory fix or disclosure/read-back. Active publication authority governs those operations. Never store private advisory details in versioned files (`docs/maintainer/security.md`, `docs/maintainer/runs/*`); read GHSA content from live GitHub or local ignored artifacts.

Keep security-shaped reports in `maintainer security` until the trust boundary is classified; never put unpatched vulnerability reports through normal issue harvest or duplicate-close flow. Quarantine only the security-shaped item so unrelated reports in the same cluster continue normally.

### `<issue-url|pr-url>`

Read the exact item first. For PRs, check `baseRefName`: a `main`-based PR runs in `../plate` under the Babysit playbook's main-line PR rule, governed by this repo's newer rules and skills.

| Item | Default owner |
| --- | --- |
| Public Slate issue | `maintainer slate-issue` |
| `udecode/plate` or `udecode/plate-private` issue | Triage playbook (`triage fix #<N>` / `triage fix plate-private#<N>` enters Bug fix; non-Beta `udecode/plate` issues report `main` and take no fixes) |
| Public Plate/Plite perf regression | Triage playbook, then Perf issue playbook with `benchmark` |
| Local Plate/Plite bug (no public mutation) | pstack Bug fix playbook |
| Plite public call-shape fork | `best-api`, then Plan playbook if adoption planning is needed |
| Already-applied PR/branch/current-tree closure | Babysit playbook |
| Internal perf/benchmark gap | Perf issue playbook with `benchmark` |
| Internal quality/browser/API gap | pstack poteto-mode |
| Cross-package architecture/refactor/deslop | Refactoring playbook, then Plan playbook |
| Plate framework/plugin/component/docs | Plan playbook, `plate-plugins`, `plate-ui`, or `plate-docs` |
| Security/advisory | `maintainer security` |
| Someone else's PR to review | Babysit playbook review-only panel ("review PR `<number>`") |
| PR review feedback | Babysit playbook |
| External corpus/issue ledger | `issue-harvester` |
| Unclear prior art | `research` |

## Public truth gate

A public issue fix closes with the evidence packet in [Bug fix playbook](../../playbooks/bug-fix.md). A complete local packet proves only `candidate-local`: it may support a comment noting a local candidate fix, never `fixed`/`completed` wording or closing as completed.

After pushing, replay the exact case on that pushed ref from a fresh process in a clean matching checkout or immutable CI artifact: prove zero tracked or untracked runtime-input diffs, record matching fingerprints, and hold the retry-free warm ledger (5 of 5 for native selection, focus, drag and drop, paint, and React DOM lifecycle) in the exact reported browser or device. Any later commit, rebase, generation, combination, or push invalidates the replay. Only a clean final-pushed-ref replay justifies `fixed`/`completed` wording or a completed close; explicit close authority never waives this gate.

Cite an issue number in a PR or issue body only when proof covers that exact report. Every routed fix ends its test title with the issue tag. Before any comment, label, close, reopen, merge, review, branch, PR, or commit, re-read live GitHub and local source proof; similarity is not permission to mutate.

## Reporter retest invalidation

A reporter's fresh exact-step retest outranks prior agent proof. When the reporter says the bug remains:

1. Mark the prior fixed/completed claim disproven.
2. Move the item to `needs-repro` and out of completed slices.
3. Compare the reporter's steps and end state against the recorded setup, input, expected result, and environment to find the missing topology, environment, or final-ref replay.
4. Reopen an issue closed as completed on that claim under current mutation authority.
5. Route a bounded bug-fix packet under Bug fix failed-fix recovery. Never defend the old proof with unit tests, a review, or a proxy route.

If the reporter confirms the main fix but reports a residual symptom, record a separate observable case or split a new issue instead of leaving it closed as completed.

## Candidate matrix and Fit Gate

For each PR, advisory, or Slate item considered (`udecode/plate` and `plate-private` rows live in `pnpm triage queue`), record: number/URL, title, source (`PR`, `advisory`, `Slate issue`, `queue scan`, `gitcrawl cluster`, `user prompt`), live state and updated date, snapshot source/freshness, category (`Slate`, `docs`, `security`, `PR review`, `external corpus`, `internal quality`, `support/noise`), VISION fit (`yes`, `no`, `unclear`), duplicate/claim guard, recommended owner, smallest proof command or blocker, authority needed, and decision (`route`, `brief-only`, `skip`, `defer`, `blocked`). Do not pad the queue; if no item is safe, say so and stop.

Before autonomous routing, an item must pass the [Triage playbook's Fit Gate](../../playbooks/triage.md#fit-gate) and have no active owner, PR, branch, assignee, or claim conflict unless takeover was requested. When fit is unclear, return a decision-ready brief.

## Authority and final handoff

Default authority is read, classify, route, patch local files when the owner allows, and hand off. Public writes need explicit active authority and otherwise wait as drafts per `AGENTS.md` Messages; loading this skill grants none. Standing authorities live in the Triage playbook's Drafts: triage comments (owner's word 2026-10-26) and field/label/close commands printed by `pnpm triage labels` (owner's word 2026-10-27), excluding duplicate closes and reopens. Stop for credentials, payments, 2FA, captcha, signups, and maintainer approval of security disclosures.

Handoff (plan Close or reply) names: repo and mode, queue snapshot and freshness, inspected slice, picked item and owner, live GitHub proof or auth blocker, claim guard, proof commands, each public write made or drafted, and what needs the owner.
