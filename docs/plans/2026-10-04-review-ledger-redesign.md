---
review_scopes: []
review_basis: []
work_kind: workflow
---

# Review ledger redesign

Status: planning, plan panel done after two rounds; building next
Playbook: plan

The review ledger records what Plate decided about each review question, what was built against it, and whether the code it looked at has moved. Today one shared 835 KB index mirrors every source file into 828 feature groups, and `check` asserts that mirror and 68 committed views against the live working tree byte for byte. Several agent sessions share that tree, so one session's new file or edit blocks or reddens every other session's record. This plan deletes the index, the feature inventory, `refresh` and the committed views. The ledger becomes its immutable record files plus one hand-edited file per scope, and every status is derived when read. It also fixes the adoption rule that closed 34 of 197 Pursue reviews the moment they were recorded.

## Public API

Agents drive the ledger through these commands; the before fences are the procedure in `.agents/rules/best-api-review.mdc` and `.agents/playbooks/build.md` at `fe0e9599a6`.

Recording a review drops the validate, check, render and check ritual.

```sh before
# .agents/rules/best-api-review.mdc
node tooling/scripts/review-ledger.mjs draft table > docs/plans/artifacts/table-review.json
node tooling/scripts/review-ledger.mjs validate docs/plans/artifacts/table-review.json
node tooling/scripts/review-ledger.mjs check
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/table-review.json
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

```sh after
# .agents/rules/best-api-review.mdc
node tooling/scripts/review-ledger.mjs draft table > docs/plans/artifacts/2026-10-06-table-review.json
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/2026-10-06-table-review.json --dry-run
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/2026-10-06-table-review.json
```

Recording an execution takes the plan path in `draft` itself.

```sh before
# .agents/playbooks/build.md
node tooling/scripts/review-ledger.mjs draft-execution docs/plans/<plan>.md > docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

```sh after
# .agents/playbooks/build.md
node tooling/scripts/review-ledger.mjs draft docs/plans/<plan>.md > docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/<outcome>.json
```

A redraft after moved sources is gone, because `record` no longer refuses on moved sources.

```sh before
# .agents/rules/best-api-review.mdc
node tooling/scripts/review-ledger.mjs draft table --from docs/plans/artifacts/table-review.json
```

```sh after
```

Mapping another session's new files and re-baselining the inventory is gone; `coverage` reports unowned files and never blocks.

```sh before
# .agents/rules/best-api-review.mdc
node tooling/scripts/review-ledger.mjs refresh
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

```sh after
node tooling/scripts/review-ledger.mjs coverage
```

`status` absorbs the queue, and `show` prints the history that 67 committed hubs held.

```sh before
# .agents/rules/research.mdc
node tooling/scripts/review-ledger.mjs queue
# AGENTS.md: read docs/research/features/table.md
```

```sh after
node tooling/scripts/review-ledger.mjs status
node tooling/scripts/review-ledger.mjs show table
```

## Hard cuts and app migration

Deleted, with the surviving owner of each job:

| Deleted | Job it carried | Survivor |
| --- | --- | --- |
| `docs/research/review-index.json` (828 features, inventory, 67 scopes, 487 record checksums, 3 groups, 284 documents, 2 rejected) | every ledger fact in one shared file | `docs/research/review-scopes/<id>.json` (67), `docs/research/review-groups.json`, `docs/research/review-documents.json`; the 487 checksums move to the write-once `docs/research/review-legacy.json`, and each new record carries its own `digest` |
| `featureId`, `discover`, `pliteExamples`, `refresh`, the inventory snapshot | feature identity and whole-tree drift detection | scope `members` paths; `coverage`; old group names still resolve in `lookup` through the records that bound them |
| The nine tracking-gap kinds (651 today, 284 of them `unbound-plan`) | surfacing loose ends | `pursue-unbound` for a landed plan naming the head without an execution; `check` warnings for plan metadata with an unknown scope, review or work kind; the rest are cut as noise |
| `docs/research/reviews.md` and `docs/research/features/*.md` (67 hubs, 2.7 MB) | queue and per-scope history views | `status` and `show` print on demand |
| `render`, `validate`, `queue`, `draft-execution`, `discover`, `--from` | view writing, dry run, queue, execution draft, census, redraft | deleted, `record --dry-run`, `status`, `draft <plan.md>` (front matter or a classified document), `coverage`, deleted |
| decision page keys `current_review`, `reconciled_executions`, `review_history`, `review_scope` | hand mirrors of ledger state | `lookup` and `show`; page bodies stay |
| the six files every draft hashed (`VISION.md`, `docs/vision/common.md`, `package.json`, `pnpm-lock.yaml`, the best-api-review skill and rule) | doctrine and method drift | `VISION.md` and `docs/vision/*.md` as a separate law clock; `method` names the method revision |

Callers that change, found with this grep (80 files before the change on 2026-10-04: 42 decision pages, 3 topic files and 35 others, counting the ledger script, its test and two generated skills; `docs/plans/topics/proof.md` breaks "ledger hub" across a line and is added by hand). After the change it finds one file, `docs/research/review-documents.json`, whose match is a historical rationale string quoting an old link:

```sh
git grep -l --untracked -E 'review-index\.json|(^|[^-a-z])reviews\.md|research/features/|draft-execution|review-ledger\.mjs (refresh|render|validate|queue|discover)|current_review|reconciled_executions|review_history|review_scope:|feature hub|ledger hub' -- ':!docs/research/review-records' ':(glob,exclude)docs/plans/*.md' ':(glob,exclude)docs/plans/*.tsv' ':!docs/research/history' ':!docs/plite/research' ':!docs/research/features' ':!docs/research/reviews.md' ':!docs/research/review-index.json' ':!docs/research/raw' ':!docs/research/probes' ':!docs/research/log.md' ':!apps/www/public' ':!apps/www/src/registry/changelog'
```

- Agent instructions: `AGENTS.md` (Feature review history), `.agents/rules/best-api-review.mdc`, `.agents/rules/research.mdc`, `.agents/playbooks/api-review.md`, `.agents/playbooks/build.md`, then `pnpm install` regenerates `.agents/skills/*`.
- Hooks: `tooling/scripts/autostage-next.mjs` stages new review records but leaves an edited or deleted one unstaged, so `check` keeps reporting it. `.gitignore` ignores the temporary file `record` links from.
- Config: `.agents/pstack.json` `pageTopic.hub` becomes `docs/research/review-scopes/{topic}.json`. `plan-page.mjs` keeps working unchanged: it checks that the file exists and falls back to the id for a title. Its header labels that path "History"; that label is plan-page's to change in dotai.
- Docs: `docs/research/schema.md` (Review history), `docs/research/README.md`, `docs/research/index.md`, `docs/research/commands/maintain.md`, `docs/research/systems/README.md`, `docs/research/systems/editor-architecture-landscape.md`, `docs/README.md`, `docs/analysis/best-api-review.md`, `docs/editor-behavior/README.md`, `current-evidence.md`, `editor-protocol-matrix.md`, `markdown-editing-reference-audit.md`, `markdown-parity-matrix.md` and `master-roadmap.md`, `docs/plite/agent-start.md`, `docs/plite/overview.md`, `docs/plite/ledgers/README.md`, `docs/plite/table-fragment-semantics.md`, `docs/plite-browser/overview.md`, `docs/plite-draft/overview.md`, `archive/README.md`, `ledgers/README.md` and `master-roadmap.md`, `docs/performance/README.md`, the two `docs/table` snapshots, the 42 decision pages, and the topic files `autocomplete.md`, `dnd.md`, `proof.md` and `plan-page.md`. Human links go to `docs/research/schema.md#review-history` and `show <scope>`.
- Unchanged on purpose: the 487 record files, dated plans, `docs/research/log.md`, research runs and probe snapshots, which are history.

## Main changes

- Records are the store. `record` writes one file with an atomic create (temp file, then `link`, which fails if the id exists) and writes nothing else. A scope's head is the review no later review of that scope names as `previous` or in `reconciliation`, so append order stops mattering; imported historical records stand in only when a scope has no review. Two heads are a visible `fork`, resolved by the next review.
- Each scope owns one file with its question, queue fields, review inputs and `members`. A path entry ending in `/` covers every file under it. Membership is `members` alone, migrated so that every census file keeps exactly its old scopes; `owners`, `consumers`, `proof` and `evidenceInputs` are what a review reads, not membership.
- A draft hashes the scope's paths, its law files and any `--input` paths, and the agent may delete entries to narrow a broad scope. `record` stores those draft-time digests and never refuses because a file moved; it reports which inputs changed since the draft and which declared scope paths the draft left out, and the record reads stale with the moved paths named.
- Integrity has no shared writer and three witnesses: the write-once checksum list in `docs/research/review-legacy.json` for the 487 existing records, each new record's own `digest` plus a re-check of its contract, and git. In git, every record and the checksum list must match, in the working tree and the index, the blob it first reached the main line with, counting merges and renames; a staged record never committed must match its index entry. A restore that is staged reads clean before it is committed. The Stop hook stages new records but never an edit or a deletion of one. `check` fails on any of them, and `record`, `status` and `next` print them as warnings without refusing. Records are corrected by a later record, never edited or deleted. `docs/research/schema.md` lists the four cases that go unnoticed: a record deleted before anything staged it, a never-committed record's edit staged by something other than the hook, a forgery staged with the checksum list before its first commit, and rewritten history.
- Another session's half-written ledger file cannot stop this one. `loadLedger` drops a file that does not parse or has the wrong shape with a warning, read commands order the queue around a dangling dependency or a cycle with a warning, and `check` turns every such warning into a failure.
- Freshness has two clocks. Source covers every input except doctrine, including an execution's proof artifacts; law covers `VISION.md` and `docs/vision/*.md` and never makes a record stale. Legacy `source.features` digests are not evaluated: such a record reads `stale` when a file, directory or proof input moved and `unknown` otherwise, never `matching`.
- A Pursue is adopted only when its one standing implementation or workflow execution is completed. An execution stands until a later one names it in `previous`; imported executions supersede each other in their old append order. Reconciliation actions are history only and never adopt. Legacy `historical-unbound` executions never adopt. `check` warns when two executions stand for one review.
- `check` reads only ledger files and git. It fails on a record that does not parse, a digest or checksum mismatch, a broken reference, an id that differs from its file name, an invalid scope, group or document entry, a dependency cycle or an AI-last conflict. Source edits elsewhere cannot fail it.
- Coverage lists files under the source roots that no scope owns, taken from `git ls-files -co --exclude-standard`, so the gitignored AI routes stop making `HEAD` fail its own check.
- Plan lifecycle reads the old status-line grammar (plain, bold, bulleted, `goal_status:` and next-line forms) and maps each word through `.agents/pstack/status.mjs`. A plan counts as landed only when every label it carries is landed, so a plan whose status says `executed` records a completed execution and a reopened `Status` beside an old `goal_status: complete` does not; `check` warns on the conflict. A plan without review front matter still drafts an execution through its `review-documents.json` entry.
- `lookup` resolves in order: scope id, group id, an old feature-group id its records bound, path ownership, then a substring of ids, titles, questions and old group ids, and only then a substring of scope paths. It returns at most 10 scopes and says how many it left out.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Base design | Arena candidate 1 with grafts (judge and lead agree, 22 of 24) | Candidate 2 or 3 (content-addressed records, exact-path membership) | `content-addressed records` |
| Legacy feature digests | Not evaluated; such records read `stale` or `unknown`, never `matching` | Freeze the cutover group membership in a 235 KB table so legacy heads keep reading `matching` | `keep legacy freshness` |
| Doctrine drift | Hash `VISION.md` and `docs/vision/*.md` as a separate law clock | The plate-next `latestVersion` number (4 of 18 doctrine commits since 2026-09-01 had no bump) | `law by version` |
| Record timing | Draft-time digests; never refuse on moved inputs | Refuse when an input moved since the draft | `refuse moved inputs` |
| `check` in CI | Stays agent-run, as today | Add `review-ledger check` to `pnpm check` | `wire check into CI` |
| Build start | Build after the panel without asking, per the owner's "go ALL steps. dont pause at step 1" | Ask Build now, Another round or Hold | `ask before build` |
| `pursue-unbound` meaning | A landed plan whose `review_basis` names the head and has no execution. This moves 17 scopes from `pursue-unbound` to `pursue-not-adopted`: pagination, basic, link, math, drawing, callout, footnote, toc, documents, distribution, ai, reads, suggestions, canvas, tags, emoji and editor-public-naming, whose only old work is imports dated before their 2026-10-04 heads | Today's "some execution or completed plan exists" | `old unbound rule` |
| Work that already satisfies a re-reviewed target | The review records Stop because the target landed, as the 2026-10-04 audit did for 11 scopes | A new execution receipt for the Pursue | `receipt for landed work` |
| Diff round 2's critical fixes | Run a third diff round on just those fixes without asking, per the owner's "go ALL steps. dont pause at step 1"; stop and ask if it finds another critical | Stop after two rounds and ask Ship, Another round or Ship the reviewed subset | `ask after two rounds` |
| Diff round 3's critical fixes | Apply them and run a fourth round on just that delta without asking, reversing the row above's stop-and-ask, because each fix is a few git flags or a narrowed claim and the owner said not to pause; a critical in round 4 stops the run for the owner's answer | Stop after round 3 and ask Ship, Another round or Ship the reviewed subset | `ask after round 3` |
| Gitignored old members | The 2 gitignored AI routes stay explicit `ai` members; 37 gitignored CLI test scratch files under `packages/cli/**/tmp-cli-*` leave the ledger, listed in the migration report | Keep the scratch files too | `keep scratch members` |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shared index | 835 KB file rewritten whole by `record` and `refresh`, no lock | Deleted; per-scope files, two side files, record files | `review-ledger.mjs` | Lost updates and merge churn on every record | Migration writes the new files once | Membership and record-byte equality | A session still running the old script after the cut | cut |
| Feature inventory | 828 groups mirrored from `featureId`; `check` asserts identity and fingerprints | Scope `members` paths | scope files | 14+ plan and log rows record blocks from other sessions' files | Exact-cover migration | Every census file keeps exactly its old scopes; old lookup terms resolve to at least their old scopes | Hand member entries drift | cut |
| Committed views | `reviews.md` and 67 hubs embed live freshness; `check` compares bytes | `status` and `show` print on demand | `review-ledger.mjs` | Any source or plan edit reddens `check`; 24 of 66 commits carried hub churn | `pageTopic.hub` repoint | `plan-page.mjs --index` renders | Readers of hub links | cut |
| Record order | Append order in the index decides "latest" | Head from `previous` and `reconciliation` | record files | No shared order to write | None; 67 of 67 heads equal today's latest | census P1 | Forks | rearchitect |
| Adoption | A retained completed execution adopts a new Pursue | Only the one standing implementation or workflow execution naming the Pursue, when completed | executions | 34 of 197 Pursues closed on arrival | Old executions read under the same rule in append order | pinned per-scope status; replay of imports and exports at 2026-09-27; tests | Intended closures reopen | rearchitect |
| Freshness inputs | Six global files plus scope paths plus feature groups, checked against live at record | Scope paths plus law plus `--input`, hashed at draft, never refused | records | Doctrine or lockfile edits refused every in-flight record | Legacy reading limit | tests; legacy count | Legacy heads read unknown | rearchitect |
| Integrity | Index checksum list rewritten by every record | Write-once legacy checksum list, a per-record `digest` and contract re-check, and each committed record's first main-line blob checked in the working tree and index | `check`, with warnings in `record`, `status` and `next` | A shared list needs a shared writer; 89 records are not in `HEAD` | Migration writes the legacy list once; the hook stops staging record edits | tests for uncommitted, legacy, committed and forged records; hook proof in a staged sandbox | The four unnoticed cases `schema.md` lists | rearchitect |
| Decision page control keys | `current_review`, `reconciled_executions` read as gaps | Removed; bodies stay | decision pages | Shared pages produce permanent gaps | Frontmatter edit on 41 pages | grep | Other sessions' page edits | cut |
| Plan lifecycle | Ledger's own `lifecycle()` regex | Old status-line grammar, word mapped by `status.mjs` `landed` | pstack helper | `executed` could not record completed | None | test; parity over the associated plans | status.mjs export change | move |
| Research search | `research` in the ledger CLI | Unchanged | `review-ledger.mjs` | Independent and used | None | existing test | None | keep |

## Comparison

Scored on the arena rubric (0 to 4 per criterion) against the incumbent with the 2026-10-04 narrowing.

| Criterion | Incumbent | Target |
| --- | --- | --- |
| Cross-session independence | 1: `check` fails on any foreign edit; records refuse on doctrine edits and foreign groups under broad scopes | 4: `record` refuses only for its own contract: a same-scope head change, an unreconciled same-scope execution, a missing reference or proof path, or a plan that disagrees with it |
| Truthful state | 1: 34 Pursues closed on arrival; 62 of 122 executions stale from plan edits | 3: explicit, reversible adoption; legacy heads read unknown |
| Cut size | 1: 2,658 lines, 13 commands, 835 KB index rewritten per record, 2.7 MB of committed views | 3: about 2,050 lines, 9 commands, no shared index, no committed views |
| Kept jobs | 4 | 4 |
| Migration honesty | n/a | 4: byte-identical records, stated legacy limit |
| Agent ergonomics | 1: seven-step ritual plus cron retries | 4: draft, dry run, record |

## Target

### Files

```text
docs/research/review-scopes/<id>.json   67 files, hand-edited
docs/research/review-groups.json        3 groups, hand-edited
docs/research/review-documents.json     286 classified documents, hand-edited
docs/research/review-legacy.json        487 legacy record checksums in old append order, write-once
docs/research/review-records/<id>.json  487 existing files unchanged, plus new ones; create-only
```

A scope file:

```json
{
  "id": "table",
  "title": "Tables and cell selection",
  "question": "What owns table topology, cell coordinates, selection, clipboard and layout?",
  "dependsOn": ["selection"],
  "prerequisiteReason": "Document topology and location rebasing constrain cell coordinates and table selection.",
  "last": false,
  "opportunity": { "score": 9, "reason": "Table topology and native cell interaction combine several expensive shared paths." },
  "owners": ["packages/platejs/src/features/table/", "packages/platejs/src/react/features/table/"],
  "members": ["packages/platejs/src/features/table/", "apps/www/tests/browser/table-selection.spec.ts", "packages/platejs/package.json"],
  "consumers": ["apps/www/src/registry/components/editor/table.tsx"],
  "proof": ["packages/platejs/src/features/table/lib/BaseTablePlugin.apply.spec.tsx"],
  "evidenceInputs": ["apps/www/playwright.config.ts"],
  "relatedScopes": ["clipboard", "geometry", "editing", "dnd"],
  "decision": "docs/research/decisions/table-ownership.md",
  "historyCandidates": ["docs/plans/5065-fix-table-tab-navigation.md"]
}
```

A scope in a review group adds `"group": "<id>"`; a scope whose `proof` is empty adds `"gaps"` saying why. Field names that keep their meaning keep their old names. Dropped: `review`, `adoption`, `proofState`, `nextOwner`, `historySearch`, `inspection`, `plans`, `opportunity.rubric`, and `gaps` where proof is not empty. They stay readable at the migration's parent commit.

A new review record keeps today's authored fields and replaces `source` with `inputs` (path to sha256; a key ending in `/` is a directory digest) and `upstreams`. Reconciliation entries drop `question`. A new execution keeps `scopes`, `reviewBasis`, `workKind`, `outcome`, `summary` and `proof` (each evidence item hashed), adds `previous` (the executions it follows), makes `plan` a path without a hash, and derives `binding` from `reviewBasis`. `record` adds `digest`, the SHA-256 of the record without it.

### Rules

- **head(s)**: the reviews of scope `s` that no other review of `s` names as `previous` or in `reconciliation`; with no review, the latest imported historical record. More than one head is `fork`.
- **standing(R)**: the bound implementation or workflow executions naming `R` in `reviewBasis` that no other such execution names in `previous`; among imported executions only the last in old append order stands.
- **adopted(R)**: `standing(R)` is exactly one execution and its outcome is completed.
- **open(s)**, in order: `fork`; `unreviewed` (no head, or a head without a verdict); closed by Stop; `deferred`; closed by adoption; `pursue-unbound` (a landed plan whose `review_basis` names the head has no execution); otherwise `pursue-not-adopted`.
- **required reconciliation** for a review of `s` with `previous` P: P, every other head of `s`, and every bound execution of `s` that no review of `s` already reconciles (2 on the records of 2026-10-04). Dates play no part, because a record's date is when it was drafted. Every entry needs an action and a reason; a changed verdict cannot `retains` its previous.
- **execution previous**: an implementation or workflow execution must name in `previous` every execution standing for its basis reviews; `draft <plan.md>` fills it.
- **freshness(record)**: `stale` when a source input changed, went missing or an upstream moved; `unknown` when there is no captured source, a legacy feature digest exists, or an upstream clone is missing; otherwise `matching`. Law is reported beside it. Directory digests use the old formula over git-listed files in per-segment name order, skipping the old ignored directory names, which reproduces 60 of 63 legacy directory digests.
- **Legacy reading**: `source.files`, `source.directories` and proof evidence compare as today, except `package.json`, `pnpm-lock.yaml` and the best-api-review skill and rule, which are not compared; `VISION.md` and `docs/vision/*` count as law; `plan.sha256`, `binding` other than `historical-unbound`, and `reconciliation[].question` are ignored. 356 records carry feature digests and so never read `matching`; the count is the number of record files with a non-empty `source.features`.

### Commands

| Command | Does | Fails only on |
| --- | --- | --- |
| `next` | First queue unit with a `fork`, `unreviewed`, `pursue-unbound` or `pursue-not-adopted` scope, with its compact lookup | nothing; another session's broken file becomes a warning |
| `status` | Open-state counts, unowned count, ordered queue rows | nothing; warnings as for `next` |
| `lookup <scope\|group\|path\|term> [--detail]` | Up to 10 scope summaries, in the resolution order under Main changes | no match (exit 1, with owners of nearby files for unowned source) |
| `show [scope]` | Markdown queue or scope history on stdout | unknown scope |
| `coverage [prefix]` | Unowned files and scope entries that match nothing | nothing |
| `draft <scope> [--input path]...` | Review draft with inputs, previous head and empty reconciliation actions | unknown scope |
| `draft <plan.md> [--input path]...` | Execution draft from the plan's front matter or classified document, its status and the standing executions | plan with no association or an unknown scope |
| `record <draft> [--dry-run]` | Validates the record alone, adds its digest, creates its file, and reports integrity problems | the record's own contract: a stale `previous`, missing reconciliation, a missing reference or proof file, a plan that disagrees with it or has invalid metadata, an id that exists with other content |
| `check` | Ledger integrity, with warnings for forks, execution forks, unowned source, dangling entries, missing documents and invalid plan metadata or conflicting status labels | unparsable or misshaped files, digest, checksum or contract mismatches, record edits or deletions in git, broken references, invalid scope, group or document entries, cycles including those inside a group |
| `research <term>` | Unchanged TSV search | unchanged |

## Scope

The sample above abridges members and owners. This plan declares no review scope, because the ledger tool is not a reviewed product question, so no execution record applies to it. In: `tooling/scripts/review-ledger.mjs` and its tests, the migration of the index into the new files, deletion of the index and generated views, the decision-page control keys, and every caller listed under Hard cuts. Out: changes to `plan-page.mjs` or `status.mjs` (both synced from dotai), `pnpm check` wiring, re-reviewing any scope, and the out-of-repo Plate v2 workflow guide (flagged for the owner).

No editor comparison, document shape, layer or native behavior applies: this is internal review tooling.

## Steps

Phase 1, preparation in a detached sandbox worktree. It changes nothing in the checkout, so it is kept or dropped as a whole.

- [x] Write the new `review-ledger.mjs`, its tests and the one-shot migration, and run them in a detached worktree holding the current records. Proof: the migration reports 0 membership differences over the census, 487 unchanged record files and the kept and dropped gitignored members; `check` exits 0; the per-scope open states equal the pinned expectation below. Done: scratch redesign/wt sandbox; migrate-sandbox.json (0 differences, 487 unchanged), check exit 0, status 31/1/35.
- [x] Prove each test fails for its named defect. Proof: each new test fails on the pre-panel code or a mutation of its rule, then passes. Done: scratch redesign/build/repro-summary.txt, repro-r2-summary.txt, repro-r2-opus.txt and mutants/ (each named test fails on the earlier code or its mutant, then passes).
- [x] Prove `lookup` keeps old names. Proof: all 627 old feature-name terms resolve to at least their old scopes. Done: scratch redesign/build/probe-k5.txt (627 of 627 terms) and probe-k5b.txt (1,455 terms and full ids, none over the cap).

Phase 2, one cutover, built in a sandbox and applied to the checkout as one patch. Revert by reverse-applying that patch, because other sessions edit the same files.

- [x] In a sandbox worktree carrying the current working tree, replace `review-ledger.mjs`, its tests and `autostage-next.mjs`, run the migration, delete the index, `reviews.md` and the hubs, strip the four control keys from the 42 decision pages, repoint every caller the grep lists, rewrite the ledger procedure in `AGENTS.md`, `best-api-review.mdc`, `research.mdc`, `api-review.md` and `build.md`, rewrite `docs/research/schema.md` Review history and the other docs, and repoint `pageTopic.hub`. Proof: the migration report, `check` exits 0, `status` equals the pinned expectation, `lookup table` stays under 15 KB, and the grep returns only history. Done: scratch redesign/wt3 at c10590ab8c; check exit 0, status pinned, lookup table 5.9 KB, caller grep leaves only a historical rationale string in review-documents.json.
- [x] Cross-session acceptance in that sandbox. Proof: with another session's untracked source file, a moved input in another scope, a `VISION.md` edit, a half-written and a misshaped foreign record, a foreign dependency cycle, a foreign plan with two Status lines and a deleted document path, `record --dry-run` succeeds for `link` and `status` and `next` still answer; with a stale `previous` it refuses; two concurrent `record` processes on one id leave one file; a deleted staged record stays visible to `check` after the Stop hook runs. Done: scratch redesign/acceptance/acceptance.txt and race.txt in sandbox wt5 (dry-run, status and next exit 0 beside every foreign state; stale previous exit 1; one record file from two racing processes); hook proof in scratch redesign/build/wt2-check-delete-new-*.txt.
- [x] Fresh-context trials, per `AGENTS.md` Routing, before the patch reaches the checkout. Proof: a fresh session in a sandbox with the old tool and instructions and one in the cutover sandbox each run "next" and record a prepared review draft there; both transcripts are saved, and the new one needs no step the old one did not. Trials record only in sandboxes. Done: scratch redesign/trials/a and trials/b (old arm 72 steps with check failing; new arm 45 steps, no refusal).
- [x] Copy every file the patch touches to scratch, apply the patch to the checkout, rerun the migration on the real tree, and run `pnpm install`. Proof: the real-tree migration report, `check` exits 0, `status` equals the pinned expectation, `sync-resources.mjs --check` passes, the generated skills carry the new text, and `node .agents/pstack/plan-page.mjs --index` lists the ledger topics. Done: scratch redesign/main-pre-apply (86 files); build/migrate-main.txt, main-check.txt, main-status.txt, main-tests.txt; pnpm install exit 0; sync-resources --check exit 0; plan-page --index lists 4 feature topics and 63 with no page yet.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Hard cut of the deleted commands, files and views, with the caller grep clean | yes | pending |
| `pstack:blast-radius` on the changed agent-facing commands | yes | pending |
| `plate-docs` on affected public docs | no | skip: no `content/docs` page teaches the ledger |
| `pstack:thermo-nuclear-code-quality-review` on code shared across packages or plugins | no | skip: the change is repository tooling, not package or plugin code |
| Changeset | no | skip: no published package changes |
| `check-plate-feature.mjs` | no | skip: not a feature-delivery plan |
| Execution record through `draft <plan.md>` and `record` | no | skip: the plan declares no review scope |
| Writing passes: `deslop` and `no-comments` on code, `unslop` on docs and agent files | yes | pending |
| Diff panel (reviews: api-build) | yes | pending |
| `pnpm lint:fix` on this task's files | yes | pending |
| Acceptance proof on the final bytes | yes | pending |
| Decision-trail review (shared script and check) | yes | pending |
| `/pstack:reflect` after the trail review | yes | pending |

## Proof

Focused tests run with `node --test tooling/scripts/review-ledger.test.mjs`. Runtime proof runs the real CLI on the real tree after migration, plus the acceptance above. The premise census behind the design is in the decision log.

Pinned `status` for the records of 2026-10-04: 67 scopes, 31 closed, 1 deferred, 35 `pursue-not-adopted`, 0 `pursue-unbound`, 0 `fork`, 0 `unreviewed`. The old `status` read 17 `pursue-unbound` and 18 `pursue-not-adopted`; the Defaults row names the 17.

## Challenge delta

Improved by two panel rounds. Round 1: Integrity moved from git alone to a write-once legacy checksum list plus a per-record digest; adoption became reversible through an execution `previous` chain; membership became `members` alone with an exact migration; proof artifacts stayed in freshness; `lookup` kept old feature names; historical imports stopped forking scopes; classified plans kept execution drafting; the phases became one cutover gate. Round 2: another session's misshaped record or scope file is dropped with a warning instead of crashing every command; a reopened status beside an old completion label no longer reads as landed; `check` verifies execution `previous` links and keeps deleted records visible through the Stop hook; reconciliation stopped trusting dates; `lookup` stopped over-matching and caps its results; migrated directory entries stay inside the census roots.
