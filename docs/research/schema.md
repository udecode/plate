# Research Schema

This is the minimal schema for the research layer.

Keep it small. The goal is consistency, not ceremony.

## Required By Page Type

### `sources/*`

Required frontmatter:

```yaml
title: ...
type: source
status: stub | partial | strong | stale
source_refs:
  - ../raw/...
updated: YYYY-MM-DD
```

### `entities/*`

Required frontmatter:

```yaml
title: ...
type: entity
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `concepts/*`

Required frontmatter:

```yaml
title: ...
type: concept
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `systems/*`

Required frontmatter:

```yaml
title: ...
type: system
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `decisions/*`

Required frontmatter:

```yaml
title: ...
type: decision
status: proposed | accepted | superseded
updated: YYYY-MM-DD
source_refs:
  - ...
related:
  - ...
```

### `open-questions/*`

Required frontmatter:

```yaml
title: ...
type: open-question
status: open | resolved
updated: YYYY-MM-DD
related:
  - ...
```

## Field Meanings

- `title`
  Human-readable page name.
- `type`
  The page class. Do not invent new values casually.
- `status`
  Lightweight coverage or lifecycle signal.
- `updated`
  Last meaningful content update.
- `source_refs`
  Pointers to raw evidence or primary repo docs.
- `related`
  Important neighboring pages in `docs/research` or source-of-truth docs.

## Rule

If a page type does not need more fields, do not add more fields.

## Review history

The review ledger records what was decided about each review question, what was built against it, and whether the source it read has moved. `node tooling/scripts/review-ledger.mjs` reads it; nothing in it is generated or committed as a view.

| File | Holds | Written by |
| --- | --- | --- |
| `review-scopes/<scope>.json` | One semantic question, its queue fields, review inputs and member source | People and agents |
| `review-records/<id>.json` | One review or execution | `record`, once |
| `review-groups.json` | Core review groups | People and agents |
| `review-documents.json` | Classified plans, decisions, reports and rejected matches | People and agents |
| `review-legacy.json` | Checksums of the 487 records that predate per-record digests, in their original order | Written once; never edited |

Stable scope ids identify the user question across package and symbol renames. Plan front matter and plan pages key on them.

### Scope files

```json
{
  "id": "table",
  "title": "Tables and cell selection",
  "question": "What owns table topology, cell coordinates, selection, clipboard and layout?",
  "dependsOn": ["selection"],
  "prerequisiteReason": "Document topology and location rebasing constrain cell coordinates and table selection.",
  "last": false,
  "opportunity": { "score": 9, "reason": "Table topology and native cell interaction combine several expensive shared paths." },
  "owners": ["packages/platejs/src/features/table/"],
  "members": ["packages/platejs/src/features/table/", "apps/www/tests/browser/table-selection.spec.ts"],
  "consumers": ["apps/www/src/registry/components/editor/table.tsx"],
  "proof": ["packages/platejs/src/features/table/lib/BaseTablePlugin.apply.spec.tsx"],
  "evidenceInputs": ["apps/www/playwright.config.ts"],
  "relatedScopes": ["clipboard", "geometry"],
  "decision": "docs/research/decisions/table-ownership.md",
  "historyCandidates": ["docs/plans/5065-fix-table-tab-navigation.md"]
}
```

- A path ending in `/` is a directory and covers every file under it; any other path is one file.
- `members` is source membership: a file belongs to every scope whose `members` name it or one of its directories. A file can belong to several scopes. Membership routes lookup and coverage; it is not a review verdict.
- `owners`, `consumers`, `proof` and `evidenceInputs` are what a review of the scope reads. Name actual owners, materially different consumers, selected proof and decision-critical shared contracts, fixtures and runners. An empty `proof` list needs `gaps` saying why; an unrelated test cannot fill it.
- `dependsOn` orders the queue and needs `prerequisiteReason`. `relatedScopes` supplies context only; it never blocks order or adopts a verdict.
- `group` names an entry of `review-groups.json`. A group reviews its member questions together; each question keeps its own records.
- `opportunity.score` uses `review-payoff-v1`: 0 means no expected value from review, 5 a bounded feature question, 10 a large shared-owner opportunity or a material unresolved design. Dependencies decide eligible work, payoff breaks ties, and `last: true` keeps AI after everything else.
- `historyCandidates` are filename-discovered plan links for intake, not inspected verdicts.

For a new proposal with no matching scope, add a scope file with the semantic question and its current comparison owners and inputs. A proposed scope can have no members; its draft hashes the real comparator files.

### Record a review

```sh
node tooling/scripts/review-ledger.mjs lookup comments
node tooling/scripts/review-ledger.mjs research 'comment'
node tooling/scripts/review-ledger.mjs draft comments > docs/plans/artifacts/2026-10-06-comments-review.json
```

The draft hashes the scope's owners, members, consumers, proof, evidence inputs and the doctrine files (`VISION.md`, `docs/vision/*.md`) into `inputs`. Add an input with `--input <path>`; delete entries to narrow a broad scope to what the review read. Complete the draft after the actual review, then record it:

```sh
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/2026-10-06-comments-review.json --dry-run
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/2026-10-06-comments-review.json
```

Complete:

- `id`: a unique lowercase slug, usually the date and scope; the draft proposes a free one.
- `question`, `requirements`: the stable question and its current jobs and hard laws, including explicit user constraints.
- `model`: the model identity, or `null` when unknown. Never reconstruct hidden instructions or invent historical model names.
- `trigger`, `evidenceReuse`: why this review runs and which earlier observations were reused or rechecked.
- `summary`, `alternatives`, `verdict`: the rationale, at least two design lanes including the strongest deletion or merger, and `stop`, `pursue` or `defer`.
- `callSites`: for a Pursue, `current` and `proposed`, each a normal call site or, when no public call changes, the ownership flow.
- `previous`, `relation`: the draft sets `previous` to the scope's head; the relation is `reaffirms`, `supersedes`, `reverses` or `defers`, or `initial` for the first review.
- `reconciliation`: one entry per record the draft lists, each with an `action` (`retains`, `reopens` or `supersedes`) and a `reason`. The draft lists the previous review, any other head, and every bound execution of the scope that no review has reconciled. Actions are history; none of them adopts anything. A changed verdict cannot `retains` its previous review.
- `references`, `proofLimits`: repository files that support the review, and the exact limits of its source, behavior, browser and performance claims.

`record` checks only the record itself and writes one file with an atomic create; it never rewrites another file. It refuses an incomplete record, a `previous` that is no longer the head, a missing reconciliation entry, a missing reference, and an id taken by other content. Recording identical content again is a no-op. It reports inputs that moved since the draft and declared scope paths the draft left out; the record then reads stale with the moved paths named. `record` adds `digest`, the SHA-256 of the record without it. Correct a completed review with a linked later record; never edit or delete one.

A Pursue whose target already landed is recorded as a Stop, with the landed work as evidence.

### Record an execution

A plan that executes reviewed work declares its association in front matter, with one `Status:` line in the body:

```yaml
review_scopes: [suggestions, authored]
review_basis: [2026-09-17-suggestions-authored-editing-final]
work_kind: implementation
```

The work kind is `design`, `implementation`, `research`, `workflow` or `verification`. Empty `review_basis` means no governing review, never implicit approval. `review_scopes: []` marks a plan that answers no review question. A historical plan without front matter can be associated through its `review-documents.json` entry; front matter wins when both exist.

```sh
node tooling/scripts/review-ledger.mjs draft docs/plans/<plan>.md > docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/<outcome>.json
```

```json
{
  "id": "2026-10-08-table-host-binding-execution",
  "kind": "execution",
  "date": "2026-10-08",
  "scopes": ["table"],
  "reviewBasis": ["2026-10-06-table"],
  "workKind": "implementation",
  "previous": [],
  "plan": "docs/plans/2026-10-06-table-host-binding.md",
  "outcome": "completed",
  "summary": "The precise implemented outcome.",
  "proof": {
    "state": "partial",
    "evidence": [{ "path": "<receipt>", "claim": "The bounded observed result." }],
    "limits": "What these observations do not establish."
  },
  "references": ["docs/plans/2026-10-06-table-host-binding.md"],
  "inputs": {},
  "upstreams": []
}
```

`upstreams` lists external checkouts a record read, each `{ "checkout": "../tiptap", "commit": "<full sha>", "files": { "<path>": "<sha256>" } }`; it is `[]` when there are none.

The draft fills the association, the outcome (`completed` when the plan's status word is landed, such as `executed` or `done`, otherwise `partial`), `previous` and `inputs`. `record` hashes each proof file. `outcome` is `completed`, `partial`, `blocked` or `abandoned`; proof is `verified`, `partial`, `unverified` or `unknown`. Verified proof needs a completed outcome and evidence beyond the plan. A matching hash establishes identity, not that a test ran. The plan stays editable after the record; its later edits stale the execution only when the plan is also listed as proof evidence.

An implementation or workflow execution names in `previous` every execution still standing for its basis reviews; the draft fills it, and `record` refuses when one is missing. A later execution supersedes the ones it names, so a partial outcome recorded after a completed one reopens the work.

### Derived state

Nothing below is stored.

- **Head.** A scope's head is the review that no later review of the scope names as `previous` or in `reconciliation`. Imported historical records stand in only when a scope has no review. Two heads are a `fork`, resolved by a review that reconciles both.
- **Adoption.** A Pursue is adopted when exactly one implementation or workflow execution stands for it and that execution is completed. Imported executions stand in their original append order. Executions imported as `historical-unbound` never adopt.
- **Open state**, checked in this order: `fork`; `unreviewed`; closed by Stop; `deferred`; closed by adoption; `pursue-unbound`, when a landed plan whose `review_basis` names the head has no execution; otherwise `pursue-not-adopted`.
- **Freshness.** `matching`, `stale` or `unknown`, computed from a record's inputs, proof files and upstream checkouts. Doctrine files report a separate law clock that never makes a record stale. A record without captured source, with an unreachable upstream clone, or with legacy feature-group digests reads `unknown` unless something it captured moved. Matching is identity, not a behavior pass.
- **Coverage.** Source under the census roots that no scope's `members` name. The census is `git ls-files` within the roots, extensions and exclusions defined in `review-ledger.mjs`, so ignored and generated files stay out.

### Commands

| Command | Use |
| --- | --- |
| `next` | The first queue unit with a `fork`, `unreviewed`, `pursue-unbound` or `pursue-not-adopted` scope, with its compact lookup |
| `status` | Open-state counts, the unowned-source count and the ordered queue |
| `lookup <scope\|group\|path\|term> [--detail]` | Compact summaries; a term matches scope ids, titles, questions, scope paths and retired feature-group names; `--detail` adds full records, plans and documents |
| `show [scope]` | Markdown history of a scope, or the queue, on stdout |
| `coverage [prefix]` | Unowned source and scope entries that match no file |
| `draft <scope\|plan.md> [--input <path>]` | A review or execution draft |
| `record <draft> [--dry-run]` | Validate and record one record |
| `check` | Ledger integrity: parse errors, digest and checksum mismatches, broken references, invalid scope, group and document entries, dependency cycles; warnings for forks, unowned source, dangling entries, missing documents and invalid plan metadata |
| `research <term>` | Search dated Plite research TSVs |

`check` reads only ledger files and git, so another session's source edits cannot fail it. `record`, `status` and `next` print the same record-integrity problems as `integrity` warnings without refusing. Integrity has three witnesses: the legacy checksums, each new record's digest and its rules (re-checked against the record's contract), and git. In git, every record and `review-legacy.json` must match, in the working tree and in the index, the blob it had when it first reached the main line. `check` reads those blobs from the tree at the commit that first added `review-legacy.json` to the first-parent history, or from `HEAD` before that commit exists, plus every later first-parent addition, counting files added by a merge or under a detected rename. A staged record that was never committed must match its index entry. To repair an edited or deleted record, restore its bytes and stage them; it reads clean before the repair is committed. The Stop hook stages new records but never an edit or a deletion of a record or of `review-legacy.json`, so those stay visible until restored. These cases go unnoticed:

- a record deleted before anything staged it;
- an edit or deletion of a never-committed record that something other than the Stop hook stages, such as `git add -A`;
- before `review-legacy.json` is first committed, a forged checksum entry, or a hand-written record that keeps every contract rule, staged together with the list, including by the Stop hook's first staging of it;
- history rewritten after a record was committed, such as an amend, rebase or squash that drops or replaces the commit that added it.

Restore a record instead of committing such a change.

### Documents and candidates

`review-documents.json` lists inspected documents with `path`, `scopes`, `kind` (`plan`, `decision`, `lesson`, `specification`, `report`, `history`), `disposition` (`active`, `historical`, `superseded`, `candidate`, `rejected`) and `rationale`. Historical plans can add `reviewBasis` and `workKind`. Record why the content answers the scope before associating it. Uninspected matches stay `candidate` or in a scope's `historyCandidates`; inspected false matches are `rejected` with the reason, so a later lookup stops suggesting them.

Decision pages under `decisions/` hold the compiled conclusion in prose. The ledger does not read them; `lookup` and `show` give the current review.

### Legacy records

The 487 records written before per-record digests keep their original shape. They are read as follows:

- `source.files`, `source.directories`, proof evidence and upstreams compare against the tree as before. Directory digests keep their formula over git-listed files.
- `package.json`, `pnpm-lock.yaml` and the best-api-review skill and rule, which every old draft hashed, are not compared; `VISION.md` and `docs/vision/*` count toward the law clock.
- `source.features` digests are not evaluated, so the 356 records that carry them never read `matching`. Count them as the record files with a non-empty `source.features`.
- `plan.sha256`, `binding` other than `historical-unbound`, and `reconciliation[].question` are ignored.

### Reuse research

`research <key-or-term>` searches all immediate dated Plite run directories' repository, query, read, lead, rejection and promotion TSVs. Output preserves each original header, path and line. An exact `status` column takes precedence; an absent status stays null instead of borrowing a decision column. Malformed rows return their original header and cells, a null parsed row and status, and a warning. Shifted columns are never presented as a valid status.

For broad terms, redirect the JSON result to an artifact and inspect bounded matches instead of streaming every source row into the conversation.

Search by semantic lead key and relevant terms. This command locates evidence; it cannot decide semantic equivalence. Reuse a read only when question, source version and dependencies match. Preserve rejection reasons and reopening conditions. Future ledgers add `scope_id`, `review_id`, `source_revision`, `source_fingerprint` and `checked_at` where applicable without replacing their existing required columns. External audit architecture, test and issue cursors remain separate under [Editor Audit](../editor-audits/index.json).
