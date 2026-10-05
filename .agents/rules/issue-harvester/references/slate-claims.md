# Slate claims

`issue-harvester slate` mode, formerly ClawSweeper.

This mode owns Slate issue-ledger provenance and claim hygiene: issue
clusters, duplicate/stale/invalid decisions, exact claim levels, fork dossier
accounting, issue coverage matrix sync, PR-body issue claim sync, and evidence
handoffs for the active Slate v2 rewrite.

## Source Of Truth

Read these first, in order:

1. `docs/plite-issues/gitcrawl-live-open-ledger.md`
2. `docs/plite-issues/gitcrawl-v2-sync-ledger.md` when it exists
3. `docs/plite-issues/open-issues-ledger.md`
4. `docs/plite-issues/gitcrawl-clusters.md`
5. `docs/plite/ledgers/fork-issue-dossier.md`
6. `docs/plite/ledgers/issue-coverage-matrix.md`
7. `docs/plite/references/pr-description.md`
8. Current implementation proof in `Plate repo root` when a claim depends on code.

The live gitcrawl ledger is generated live input only. The v2 sync ledger owns
current manual issue classifications. The frozen open issues ledger is the
`682`-issue historical classification seed, not current live truth. The fork
issue dossier owns long-form fork-local issue sections. The issue coverage
matrix owns exact implementation claims. The PR description must stay synced
with exact claims, counts, proof references, and non-claims.

## Core Rules

[Gitcrawl](./gitcrawl.md) holds the gitcrawl install, `<update>` mode and
archive-first discovery commands this mode uses.

- Do not process the live issues one by one. Cluster first, then route by
  architecture owner; external editor corpora are clustered across open and
  closed issues before `issue-harvester` processes unchecked rows.
- Do not use `Fixes #...` unless the exact original repro is proven end to end.
  The [claim levels](#claim-levels) are exact: `cluster-synced` and
  `improves-claimed` are never closure claims.
- Invalid, duplicate, stale, docs/example, ecosystem, and support-noise rows get
  a reason, not architecture work.
- If current behavior is uncertain, classify as `needs-repro`; do not design for
  ghosts.
- Avoid sweep storms. If an exact issue surface was already swept and the claim
  set did not change, cite the prior sweep instead of rerunning broad discovery.
- If this mode discovers implementation, security, public queue, PR review, or
  maintainer-choice work, write an owner handoff. Do not execute it here.

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

Search broadly before deciding. Do not stop at the first related thread when a
claim depends on duplicate chains, stale closures, or already-landed fixes.

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

## Issue Ledger Processing Loop

Use this when the user gives issue refs, a cluster, or a ledger batch and wants
provenance, duplicate/stale/invalid classification, claim sync, or fork dossier
accounting.

For each issue:

1. Read ledger row and live thread when needed.
2. Search related issues, duplicates, closed threads, and current code.
3. Trace the real runtime path in `Plate repo root` or legacy `../slate`.
4. Try a focused repro or proof.
5. Classify before writing claim text or ledger sync.
6. Decide the claim level and ledger action.
7. Update the v2 sync ledger, issue coverage matrix, active plan, and PR
   description if claim status changes.
8. Write an owner handoff when code, public queue, security, or product work is
   needed.
9. Run the smallest meaningful verification for changed ledger/provenance
   artifacts.

Ledger changes must pass every gate:

- symptom is reproducible or provable through logs, failing test, browser proof,
  dependency contract, or current code behavior
- root cause is traceable to code with file/line
- owner boundary is clear enough to choose a claim level or handoff owner
- dependency behavior is checked against source/docs/types when relevant
- browser/runtime/selection behavior has real behavior proof when tests alone do
  not prove the user-visible path

Use `needs-repro`, `needs-human`, `not-claimed`, or owner handoff instead of a
claim when:

- not a bug
- current repro is missing
- stale environment/version issue
- duplicate already covered
- docs/example/support/release noise
- ecosystem/product request outside raw Slate
- broad architecture refactor is the right owner
- owner boundary is unclear
- no focused proof is feasible

Do not pad a batch with low-confidence claims. If no issue can be classified,
say so and leave the row as `needs-repro` or `needs-human`.

## Owner Handoff Routing

Adapt upstream `queue_fix_pr` discipline only as handoff classification. This is
not permission to mutate GitHub, choose public queue priority, or patch runtime.

For external editor issue harvests, "work candidate" means "candidate local
Slate/Plate invariant or test gap" until the harvester matrix proves a current
Slate bug. Do not route external issues directly to implementation.

External issue harvest routing:

- `portable-invariant`: issue cluster exposes raw editor behavior worth mapping
  to Slate v2 tests.
- `portable-mixed`: issue contains a useful raw invariant mixed with product or
  framework details; split before action.
- `plate-owned`: issue pressure belongs to Plate plugin/product/API/DX.
- `framework-specific`: Lexical/editor internals only; skip with reason.
- `support-docs-release`: not robustness input; skip with reason.
- `security-quarantine`: security-shaped report; keep out of normal harvest.
- `needs-source-proof`: issue looks interesting but no test/source/current
  Slate evidence supports a behavior invariant yet.

Use `handoff: focused fix path` only when all are true:

- the issue is valid and not already covered by a merged/current fix
- the fix is narrow enough for one focused patch
- likely files and validation commands are clear
- related reports can be handled by one canonical fix instead of duplicate
  patches
- no security, product, public-API direction, migration, broad architecture, or
  maintainer-policy decision is required first

Use `manual review` / `needs-human` when the item may matter but needs an API
direction, product boundary, migration policy, security handling, or maintainer
judgment before implementation. Use `none` for stale/unclear reports, support
noise, ecosystem work, already-covered duplicates, or anything paired with an
open fix PR.

For automatic-looking bug fixes, hand off one public Slate issue to
`maintainer slate-issue` and any other public issue to `maintainer` instead of
patching from this mode. Only that coordinator may hand a normalized
local repair packet to pstack's Bug fix playbook. Keep the bar stricter: exact current repro,
high confidence, no new feature/config option, no product decision, narrow
code owner, and focused regression proof.

## Provenance And Live-State Bar

Use upstream `implemented_on_main` discipline as the model for `already-accounted`
and `triage-closed` classifications:

- verify current source behavior, tests/docs when relevant, and history
- name the canonical issue/PR or fix commit when known
- distinguish shipped release evidence from "only on current v2/main"
- record live GitHub checked state when stale, duplicate, or closure-style
  classifications depend on current open/closed/comment status
- preserve unique reproduction logs, platforms, versions, or browser/native
  details by linking them from the canonical dossier row instead of flattening
  them away

If you cannot point to concrete code/docs/history/related-item evidence, keep
the row open as `needs-repro`, `issue-reviewed`, or `needs-human`.

For external editor issue harvests:

- preserve open and closed state separately in the scratch issue index;
- record whether a representative was read from issue title only, body,
  comments, linked PR, source/test, or current Slate coverage;
- never treat an external closed issue as stale noise automatically;
- never treat an external fixed issue as a Slate closure claim;
- use external issue refs only as provenance for fresh local invariants.

## Fork Issue Dossier Mode

Use this mode when the user wants OpenClaw-style issue comments adapted for the
Slate v2 fork. Do not comment on upstream GitHub issues in this mode.

OpenClaw writes curation state and lets GitHub comments derive from that state.
For Slate v2, the derived projection is one committed markdown dossier:

`docs/plite/ledgers/fork-issue-dossier.md`

That file is the public-facing accounting layer for the fork. Every issue
section must be self-contained enough that a maintainer can audit the claim
without opening five side files.

Default compiled output targets:

- Full corpus: `docs/plite/references/pr-description.md` gets summarized
  counts and exact claim text only.
- Detailed corpus: append one section per issue to
  `docs/plite/ledgers/fork-issue-dossier.md`.
- Batch scratch files are allowed only as temporary working notes. The durable
  issue-by-issue output belongs in the fork issue dossier.
- Generated live issue rows stay in `docs/plite-issues/gitcrawl-live-open-ledger.md`.
- Current manual issue sync stays in `docs/plite-issues/gitcrawl-v2-sync-ledger.md`.
- Cluster truth stays in `docs/plite-issues/gitcrawl-clusters.md`.
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

## Hard Stops

Stop and ask or mark `needs-human` when:

- exact closure depends on unavailable browser/device proof
- duplicate grouping conflicts
- the issue is security/advisory-like, mentions CVEs/GHSAs/exploitability,
  leaked secrets, credentials, tokens, private keys, authz/sandbox bypass,
  XSS/CSRF/RCE/SSRF, sensitive data exposure, or supply-chain compromise
- product policy would leak into raw Slate
- live GitHub contradicts the live gitcrawl ledger in a way that changes the
  claim
- the proposed fix belongs in Plate, slate-yjs, docs, examples, or ecosystem
  tooling instead of raw Slate

Security-sensitive rows are item-scoped quarantines. Do not let one
security-shaped related ref poison unrelated non-security bugs in the same
cluster, but do not route the sensitive item through backlog cleanup or a
normal fix claim.
