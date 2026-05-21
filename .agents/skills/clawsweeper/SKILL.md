---
description: 'Triage and process the Slate v2 issue ledger with OpenClaw-style sweep discipline: archive-first discovery, duplicate proof, small-fix gates, exact claim rules, maintainer-safe issue output, and gitcrawl API refreshes.'
argument-hint: '[<update> | issue refs | cluster name | ledger batch | sweep goal]'
disable-model-invocation: true
name: clawsweeper
metadata:
  skiller:
    source: .agents/rules/clawsweeper.mdc
---

# ClawSweeper

Use this skill for Slate issue-ledger triage and processing: issue clusters,
duplicate/stale/invalid decisions, small high-confidence repro/fix candidates,
PR-body issue claim sync, and execution prompts for the active Slate v2 rewrite.

This is adapted from `../openclaw/.agents`: ClawSweeper, duplicate-tagging,
small-bugfix-sweep, gitcrawl, maintainer-triage, and testing skills. Keep the
useful discipline. Drop the OpenClaw bot/app/automerge machinery.

## Pulled-In Skill Sections

This is one skill on purpose. Do not load or recreate these as separate
Plate-local skills unless a future workflow needs a real standalone command.

- `gitcrawl`: archive-first candidate discovery, local mirror freshness, related
  closed/open thread search.
- `tag-duplicate-prs-issues`: duplicate proof bar and one-cluster discipline,
  without `prtags` writes or GitHub comment sync.
- `openclaw-small-bugfix-sweep`: one-by-one high-certainty issue loop, skip
  rules, narrow local proof.
- `openclaw-pr-maintainer`: maintainer evidence bar, no speculative closure,
  no claim without repro/root-cause/fix-path proof.
- `openclaw-testing`: cheapest safe verification path for the touched surface.
- `openclaw-test-performance`: evidence-first benchmark/profiling discipline,
  only for `v2-performance-benchmark` rows.

## Source Of Truth

Read these first, in order:

1. `docs/slate-issues/gitcrawl-live-open-ledger.md`
2. `docs/slate-issues/gitcrawl-v2-sync-ledger.md` when it exists
3. `docs/slate-issues/open-issues-ledger.md`
4. `docs/slate-issues/gitcrawl-clusters.md`
5. `docs/slate-v2/ledgers/fork-issue-dossier.md`
6. `docs/slate-v2/ledgers/issue-coverage-matrix.md`
7. `docs/slate-v2/references/pr-description.md`
8. Current implementation proof in `.tmp/slate-v2` when a claim depends on code.

The live gitcrawl ledger is generated live input only. The v2 sync ledger owns
current manual issue classifications. The frozen open issues ledger is the
`682`-issue historical classification seed, not current live truth. The fork
issue dossier owns long-form fork-local issue sections. The issue coverage
matrix owns exact implementation claims. The PR description must stay synced
with exact claims, counts, proof references, and non-claims.

## Gitcrawl Install And CLI Baseline

Use the Homebrew tap install unless the user explicitly asks for a source build:

```bash
brew install openclaw/tap/gitcrawl
gitcrawl --version
gitcrawl doctor --json
```

If Homebrew reports that `gitcrawl` is shadowed by an older local build, fix the
PATH entry or call the brewed binary directly. The normal brewed path is:

```bash
/opt/homebrew/bin/gitcrawl
```

Current stable release baseline: `0.2.1`. Commands documented only on
`openclaw/gitcrawl` `main`, such as `metadata --json` and `status --json`, are
optional control-surface probes until they exist in the installed binary. Do not
make a ClawSweeper lane depend on them unless `gitcrawl --version` and
`gitcrawl <command>` prove they are available.

The `gh` shim is optional. Prefer side-by-side `gitcrawl-gh` if a workflow needs
cached `gh` reads:

```bash
ln -sf "$(command -v gitcrawl)" "$HOME/bin/gitcrawl-gh"
gitcrawl-gh issue view <number> -R ianstormtaylor/slate --json number,title,state,url,body,labels,author
```

Only replace global `gh` when the user asks. If `gh` is shadowed by the shim,
set `GITCRAWL_GH_PATH` to the real GitHub CLI path to avoid recursion.

## `<update>` Mode

When the argument is exactly `<update>`, run a ClawSweeper tooling refresh
instead of issue triage. Do not process issues, edit ledgers, or update PR
claims in this mode.

Update flow:

1. Update the Homebrew tap metadata and installed binary:

   ```bash
   brew update
   brew upgrade openclaw/tap/gitcrawl || brew install openclaw/tap/gitcrawl
   gitcrawl --version
   gitcrawl doctor --json
   ```

2. If `gitcrawl` is shadowed by an older local source-build symlink, either
   retarget that symlink to `/opt/homebrew/bin/gitcrawl` when it is clearly
   agent-owned, or record the shadowing caveat and call `/opt/homebrew/bin/gitcrawl`
   directly.
3. Inspect the updated API surface from the installed binary:

   ```bash
   gitcrawl --help
   gitcrawl doctor --json
   gitcrawl search issues "composition" -R ianstormtaylor/slate --state open --json number,title,state,url --limit 2
   ```

4. If `../gitcrawl` exists, scan the fresh repo docs and skill for new command
   shapes before editing this rule:

   ```bash
   git -C ../gitcrawl pull --ff-only
   sed -n '1,220p' ../gitcrawl/docs/installation.md
   sed -n '1,260p' ../gitcrawl/docs/commands.md
   sed -n '1,260p' ../gitcrawl/docs/gh-shim.md
   sed -n '1,260p' ../gitcrawl/.agents/skills/gitcrawl/SKILL.md
   sed -n '1,220p' ../gitcrawl/CHANGELOG.md
   ```

5. Update `.agents/rules/clawsweeper.mdc` for new or changed gitcrawl install,
   command, JSON, sync, search, cluster, TUI, or gh-shim APIs. Also update the
   stable baseline version above when the brewed version changes.
6. Regenerate generated agent files from the source rule:

   ```bash
   pnpm install
   ```

7. Verify the source rule and generated skill are in sync:

   ```bash
   rg -n "Gitcrawl Install And CLI Baseline|<update>|brew update|sync --numbers|sync-if-stale|gitcrawl-gh" .agents/rules/clawsweeper.mdc .agents/skills/clawsweeper/SKILL.md
   bun run completion-check
   ```

If a new gitcrawl release documents commands that are only on `main` and not in
the brewed binary, record them as optional future probes instead of making the
ClawSweeper workflow depend on them.

## Core Rules

- Do not process 630 live issues one by one. Cluster first, then route by architecture
  owner.
- Do not use `Fixes #...` unless the exact original repro is proven end to end.
- `cluster-synced` means architecture pressure is absorbed. It is not a closure
  claim.
- `improves-claimed` means current v2 work materially improves the issue but
  does not prove exact closure.
- `fixes-claimed` means exact repro proof exists and the PR may claim it.
- Invalid, duplicate, stale, docs/example, ecosystem, and support-noise rows get
  a reason, not architecture work.
- If current behavior is uncertain, classify as `needs-repro`; do not design for
  ghosts.
- Verify every actionable issue against live gitcrawl or live GitHub when
  current state matters, plus current code, before writing any claim.
- Keep Slate raw and unopinionated. Product/editor UX requests become substrate
  requirements only when they expose a real raw Slate primitive gap.
- No GitHub comments, labels, closes, commits, pushes, or PRs unless the user
  explicitly asks for that action.

## Action Buckets

Use the existing bucket names exactly:

- `v2-input-runtime`
- `v2-dom-selection`
- `v2-react-runtime`
- `v2-core-engine`
- `v2-clipboard-serialization`
- `v2-api-dx`
- `v2-performance-benchmark`
- `needs-repro`
- `skip-invalid`
- `skip-duplicate`
- `skip-stale`
- `skip-maintainer-noise`
- `docs-examples`
- `ecosystem-boundary`
- `already-accounted`

Do not invent a new bucket unless the ledger and active plan are updated in the
same turn.

## Archive-First Discovery

When `gitcrawl` is available and has Slate data, use it first for candidate
discovery, duplicate attempts, related closed issues, and cluster neighbors.
Treat it as candidate generation only.

Start with local readiness and freshness:

```bash
gitcrawl doctor --json
```

Read `version`, `last_sync_at`, `repository_count`, `thread_count`,
`open_thread_count`, `cluster_count`, and token presence. A missing GitHub token
blocks `sync` and live shim fallthroughs; it does not block read-only archive
inspection when the local database already has the needed rows.

Useful shapes:

```bash
gitcrawl threads ianstormtaylor/slate --numbers <issue-or-pr-number> --include-closed --json
gitcrawl neighbors ianstormtaylor/slate --number <issue-or-pr-number> --limit 20 --json
gitcrawl search ianstormtaylor/slate --query "<title, scope, or failure phrase>" --mode hybrid --limit 20 --json
gitcrawl search issues "<title, scope, or failure phrase>" -R ianstormtaylor/slate --state open --sync-if-stale 5m --json number,title,state,url,updatedAt,labels --limit 20
gitcrawl cluster-detail ianstormtaylor/slate --id <cluster-id> --member-limit 20 --body-chars 280 --json
gitcrawl sync ianstormtaylor/slate --numbers <issue-or-pr-number> --include-comments --with pr-details --json
gitcrawl gh issue view <issue-or-pr-number> -R ianstormtaylor/slate --json number,title,state,url,body,comments,labels,author,closedAt
gitcrawl gh pr view <pr-number> -R ianstormtaylor/slate --json number,title,state,url,isDraft,author,headRef,baseRef,files,commits,checks
```

Use `sync --numbers` for exact row hydration before a duplicate, stale, or
closure decision that depends on comments, PR detail, or fresh state. Use
`search issues ... --sync-if-stale <duration>` for ad-hoc candidate discovery
where a bounded staleness window is enough.

If `gitcrawl` is missing, stale, or lacks Slate data, fall back to the local
ledger, `docs/slate-issues/**`, and targeted `gh` reads/searches. Treat stale
data as blocking only when the decision depends on it. Note the fallback; do not
block normal triage.

Live GitHub is final truth for current state, comments, duplicate links, and
whether a thread is still open. Use the shim first when it is installed and
fresh enough; otherwise use real `gh`:

```bash
gitcrawl-gh issue view <number> -R ianstormtaylor/slate --json number,title,state,body,comments,labels,url,closedAt
gitcrawl-gh search issues "<key phrase>" -R ianstormtaylor/slate --match title,body --limit 50 --json number,title,state,url
gh issue view <number> --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,closedAt
gh search issues --repo ianstormtaylor/slate --match title,body --limit 50 -- "<key phrase>"
gh search issues --repo ianstormtaylor/slate --match comments --limit 50 -- "<error or maintainer phrase>"
```

Search broadly before deciding. Do not stop at the first related thread when a
claim depends on duplicate chains, stale closures, or already-landed fixes.

Do not assume `gitcrawl` has an API server. The current tool is a local CLI,
SQLite archive, TUI, and optional `gh` shim.

## Duplicate Decision Bar

Do not call something duplicate because titles look similar.

Require at least two evidence categories:

- same user-visible problem
- same reproduction story or failure mode
- same likely fix area
- same linked PRs or maintainer discussion
- same browser/native behavior edge
- same code surface or runtime subsystem

Outcomes:

- `skip-duplicate`: strong evidence that the row duplicates another issue or
  cluster already accounted for.
- `needs-repro`: similar wording but root cause or behavior is unclear.
- `cluster-synced`: duplicate family maps to a v2 architecture owner.
- `not-claimed`: duplicate/product/support context stays outside v2.

If a row appears to belong to two unrelated clusters, stop and record
`needs-human`. Do not force a prettier taxonomy.

## Small-Fix Sweep Loop

Use this when the user gives issue refs or asks for processable issues.

For each issue:

1. Read ledger row and live thread when needed.
2. Search related issues, duplicates, closed threads, and current code.
3. Trace the real runtime path in `.tmp/slate-v2` or legacy `../slate`.
4. Try a focused repro or proof.
5. Classify before patching.
6. Fix locally only if this is a current bug, root cause is clear, the patch is
   narrow, and focused regression proof is practical.
7. Update the v2 sync ledger, issue coverage matrix, active plan, and PR
   description if claim status changes.
8. Run the smallest meaningful verification.

Qualified candidates must pass every gate:

- small owner/surface with likely narrow fix and focused regression proof
- symptom is reproducible or provable through logs, failing test, browser proof,
  dependency contract, or current code behavior
- root cause is traceable to code with file/line
- proposed fix touches the implicated path
- no strong smell that broader architecture, owner-boundary work, or product
  policy is the real owner
- dependency behavior is checked against source/docs/types when relevant

Skip instead of patching when:

- not a bug
- current repro is missing
- stale environment/version issue
- duplicate already covered
- docs/example/support/release noise
- ecosystem/product request outside raw Slate
- broad architecture refactor is the right owner
- owner boundary is unclear
- no focused proof is feasible

Do not pad a batch with low-confidence fixes. If no issue qualifies, say so.

## Verification Discipline

Prove the touched surface first:

1. Reproduce narrowly before fixing when a repro path exists.
2. Fix the root cause.
3. Rerun the same narrow proof.
4. Broaden only when the touched contract demands it.

For `.tmp/slate-v2`, prefer focused package tests, focused Playwright greps, and
package typecheck before broad gates. Use `bun check:full` only when the issue
claim needs release-quality browser coverage.

For performance buckets, establish baseline before changing code. Record wall
time, hot path, DOM/heap/component/listener counts, or benchmark artifact as
appropriate. No "seems faster" claims.

## Fork Issue Dossier Mode

Use this mode when the user wants OpenClaw-style issue comments adapted for the
Slate v2 fork. Do not comment on upstream GitHub issues in this mode.

OpenClaw writes curation state and lets GitHub comments derive from that state.
For Slate v2, the derived projection is one committed markdown dossier:

`docs/slate-v2/ledgers/fork-issue-dossier.md`

That file is the public-facing accounting layer for the fork. Every issue
section must be self-contained enough that a maintainer can audit the claim
without opening five side files.

Default compiled output targets:

- Full corpus: `docs/slate-v2/references/pr-description.md` gets summarized
  counts and exact claim text only.
- Detailed corpus: append one section per issue to
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- Batch scratch files are allowed only as temporary working notes. The durable
  issue-by-issue output belongs in the fork issue dossier.
- Generated live issue rows stay in `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- Current manual issue sync stays in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- Cluster truth stays in `docs/slate-issues/gitcrawl-clusters.md`.
- Frozen open ledger notes are historical context only; do not require them for
  every dossier section.

For each issue, write this shape:

```md
## #<issue> <title>

Status: fixes-claimed | improves-claimed | cluster-synced | issue-reviewed | not-claimed | triage-closed | needs-repro | needs-human
Bucket: <action-bucket>
Confidence: high | medium | low

Issue summary:
<one tight paragraph>

Evidence:

- ledger row: <cluster/status/source>
- related issues: <refs or none found>
- duplicate/stale/invalid proof: <if applicable>
- live GitHub checked: yes | no, live-gitcrawl-only
- current v2 proof: <tests/files/plan refs or none>

Decision:
<why this status is correct>

PR-description text:
<exact short text to include, or "none; detailed ledger only">
```

Rules for compiled sections:

- Use the exact issue title when available.
- Keep issue refs unescaped like `#6034` when auto-linking matters.
- Do not write `Fixes #...` unless the section status is `fixes-claimed`.
- For `cluster-synced`, explain the architecture owner, not a fake closure.
- For `triage-closed`, name the close class: duplicate, invalid, stale, or
  maintainer-noise.
- For `needs-repro`, state the missing proof plainly.
- For `not-claimed`, state the boundary: docs/example, ecosystem, product,
  support, release, or outside raw Slate.
- Keep each section deterministic. Same issue and same evidence should produce
  the same status and PR text.

## Claim Levels

Use these exact claim levels in reports:

- `fixes-claimed`: exact repro proved and fixed.
- `improves-claimed`: materially improved, no exact closure claim.
- `cluster-synced`: architecture owner covers the pressure.
- `issue-reviewed`: reviewed and routed, no fix claim.
- `not-claimed`: deliberate non-claim.
- `triage-closed`: invalid, duplicate, stale, or maintainer-noise closure path.
- `needs-repro`: no architecture/fix claim without current repro.
- `needs-human`: taxonomy, maintainer intent, or product boundary needs a human.

## Output Shape

For a single issue:

```text
Decision: fixes-claimed | improves-claimed | cluster-synced | issue-reviewed | not-claimed | triage-closed | needs-repro | needs-human
Issue: #<n> <title>
Bucket: <action-bucket>
Confidence: high | medium | low

Evidence:
- ...
- ...

Action:
- v2 sync ledger: update needed | already synced | no change
- coverage matrix: update needed | no exact claim
- PR description: update needed | no change
- implementation: none | focused fix path
- verification: <command/proof or required repro>
```

For a batch:

```text
Ledger:
- fixed-local: ...
- improves-claimed: ...
- cluster-synced: ...
- needs-repro: ...
- skipped: ...
- needs-human: ...

Next slice:
- ...
```

## GitHub Action Safety

Only act on GitHub when the user explicitly asks. If asked to comment or prepare
maintainer text:

- use literal multiline bodies or heredocs, not escaped `\n`
- avoid `gh issue/pr comment -b "..."` for bodies with backticks or shell chars
- do not wrap issue refs like `#123` in backticks when auto-linking matters
- include proof links or file refs for closure/claim comments

## Hard Stops

Stop and ask or mark `needs-human` when:

- exact closure depends on unavailable browser/device proof
- duplicate grouping conflicts
- the issue is security/advisory-like
- product policy would leak into raw Slate
- live GitHub contradicts the live gitcrawl ledger in a way that changes the
  claim
- the proposed fix belongs in Plate, slate-yjs, docs, examples, or ecosystem
  tooling instead of raw Slate
