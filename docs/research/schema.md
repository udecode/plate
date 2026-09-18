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

[The feature ledger](reviews.md) is a generated view of
[review-index.json](review-index.json). Stable scope IDs identify the user
question across package or symbol renames. Source-derived feature IDs identify
its current members; reconcile a rename explicitly rather than losing history.
Source groups have a primary review address; that address is not a verdict
about every job in the directory. Each question names actual owners,
materially different consumers and selected proof. Shared owners can appear
in several questions. Each census member retains its disposition and source
fingerprint. The index records the inventory boundary and exclusions.

For a new proposal with no matching scope, add the semantic question and its
current comparison owners and evidence inputs to the index. A proposed scope
can have no current members. Its draft fingerprints the actual comparator files;
proposed APIs are not counted as existing features or given invented paths.

Keep three relationships separate:

- `dependsOn` names the minimal review prerequisites and
  `prerequisiteReason` explains the governing law. Existing evidence can settle
  a prerequisite without another review.
- `relatedScopes` links contextual questions and their original history. It
  does not block queue order, adopt a verdict or supply the new record's
  `previous` value. Use it to retain context when a broad question is split.
- `evidenceInputs` names additional decision-critical files or directories,
  including shared contracts, fixtures and runners. These inputs contribute
  fingerprints; queue dependencies do not.

The opportunity score uses `review-payoff-v1`: 0 means no expected value from
review, 5 means a bounded feature question, and 10 means a large shared-owner
opportunity or a material unresolved design. The reason is required. These
are preliminary judgments about where to investigate, not completed
architecture scores. Dependencies determine eligible work; higher payoff
breaks ties. The explicit AI-last constraint wins over its score.

Scope state stays independent:

| Field | Meaning |
| --- | --- |
| `review` | `unassessed`, `historical`, or `reviewed`, derived from available records |
| `adoption`, `proofState` | Legacy scope claims, retained as unbound history; generated progress comes from execution records |
| record freshness | `matching`, `stale`, or `unknown`, computed from source identity; matching is not a behavior pass |
| `historyCandidates` | Filename-discovered plan links for intake, not inspected verdicts |
| `inspection` | Actual inspection depth; located entrypoints are not completed source or assertion reviews |
| `gaps` | Unresolved scope-specific ownership, provenance, behavior or proof limits |

The inventory observes editable source, exported package entrypoints, copied
registry components/examples/values, actual shared Plite examples, editor
browser specs, AI service routes and proof/tooling inputs. It also names every capability in the
canonical `PLUGINS` catalog, including marks and styles sharing one file, with
their literal property consumers. A catalog entry with no such read is a
declared capability, not proof of unreachable code; dynamic use is not ruled out.
The Plite example table reconciles exact catalog keys with actual dynamic
loaders and implementation files; display labels do not invent route names.
Its count is source/capability/entrypoint groups, not independent reviews. See the index's
`inventory` fields for exact roots and exclusions. `discover` lists each
group's file count, fingerprint and source example. A new or removed group
fails `check` until explicitly reconciled. Changes within a group invalidate
its inventory fingerprint. `refresh` updates that observation without
altering any review or proof record. The snapshot records the base Git commit
and a fingerprint of local inventory observations. Local source may differ
from that commit or GitHub, including files that are not published. The
generated view and `lookup` expose observation freshness separately from a
record's evidence freshness.

### Core architecture review groups

`reviewGroups` in the index groups only approved core architecture questions
into one investigation. Each group declares a unique `id`, `title`, `reason`
and at least two existing `scopes`. A question belongs to at most one group.
Ungrouped questions each remain a separate review; features such as math,
emoji, tables and comments are independent.

The current groups are `plite-core` (runtime, state, schema and commands),
`plite-view` (React, selection, native input, accessibility and geometry), and
`plate-core` (Plate API and distribution). Compiler/CLI and registry kits remain
separate questions.

`node tooling/scripts/review-ledger.mjs queue` returns the ordered review units.
Groups inherit their highest member payoff and external prerequisites; internal
prerequisites stay attached to their questions. Grouping cannot introduce a
dependency cycle or bypass AI-last. The generated ledger counts a group as
pending while any member lacks a recorded review. Source freshness, adoption
and proof remain separate from this count.

Use `$best-api-review audit plite-core` for the combined investigation and
`node tooling/scripts/review-ledger.mjs lookup plite-core` for every member's
source, proof and history. Compare the whole architecture, then give each
question a verdict. One finding does not end the remaining group coverage.
Use the existing `draft <scope>` and `record <json>` commands for each member's
record; groups do not own verdicts or copy records. Exact scope lookup still
selects that one question and reports its group; broader text searches remain
available.

### Record a review

Run commands from the repository root:

```sh
node tooling/scripts/review-ledger.mjs lookup comments
node tooling/scripts/review-ledger.mjs research 'comment'
node tooling/scripts/review-ledger.mjs draft comments > docs/plans/artifacts/comments-review.json
```

Use an existing artifact directory, creating it when needed. Complete the
draft after the actual review, then record it:

```sh
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/comments-review.json
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

Historical references keep their recorded paths when adoption deletes a file.
Missing captured evidence makes source freshness stale; it does not invalidate
the immutable record. New records and current scope evidence must exist.

The draft is not a verdict. It captures the scope's source groups, declared
owners, consumers, selected proof, additional evidence inputs and durable law.
Directory fingerprints detect added or removed files. Add any further
decision-critical source or runner before recording. An empty proof list must
have an explicit gap; an unrelated test cannot fill it. Complete:

- `id`: unique lowercase slug, usually date, scope and iteration.
- `scope`, `date`, `question`, `requirements`: stable question and current jobs
  and hard laws, including explicit user constraints.
- `model`: available model identity, or `null` when unknown. Never reconstruct
  hidden instructions or invent historical model names.
- `method`: the method/rubric revision used for this review.
- `trigger`, `evidenceReuse`: why this review runs and which prior observations
  were reused or rechecked. An ordinary repeat request is sufficient, even
  with unchanged source and model.
- `summary`, `alternatives`, `verdict`: concise rationale and the material
  design lanes, including the strongest deletion/merger alternative, with
  `stop`, `pursue`, or `defer`.
- `previous`, `relation`: the latest effective record and `reaffirms`,
  `supersedes`, `reverses`, or `defers`; use `null` and `initial` on first review.
- `reconciliation`: entries with `record`, `question`, `action` (`retains`,
  `reopens`, `supersedes`) and `reason`. Reconcile the latest review and later
  execution, plus any earlier material conclusion touched by this question.
  A source change requires inspection; it does not reopen unrelated decisions.
  Old immutable records without these entries remain valid historical records.
- `references`, `proofLimits`: repository-relative evidence artifacts and the
  precise limits of source, behavior, browser and performance claims.
- `source`: SHA-256 file, directory-membership and source-group fingerprints.
  Every declared owner, consumer, proof and evidence input must be captured.
  Optional `upstreams` entries
  contain a local `checkout`, full `commit`, and repository-relative `files`
  with hashes. Lookup checks their current commit and selected file hashes;
  missing clones yield unknown. A recorded clone is not asserted latest.

The record command rejects incomplete reviews, stale captured source and an
unreconciled previous review. It writes `review-records/<id>.json` once and
indexes its checksum. Repeating the identical command is idempotent; changing
an existing record's contents is rejected. Correct a completed review with a
linked later record. The validator detects changed record contents; it is not
a tamper-proof archive against someone rewriting both record and index.

Historical imports use `kind: historical`, the original date and evidence
links, and `source: null` when source identity is not recoverable. Unknown
models remain null. A recovered verdict is optional: an execution plan or a
multi-candidate performance run need not have one aggregate verdict. Use
`historical-context` when a record supplies context without adjudicating its
predecessor. Original files, rejected alternatives and failed observations
remain authoritative. Importing a record never replays or promotes its proof.

### Compile the current decision

For a decision with repeated reviews, add these fields to its existing
frontmatter rather than creating another decision page:

```yaml
review_scope: comments
current_review: 2026-09-09-comments-package-data
reconciled_executions: []
review_history:
  - ../review-records/2026-09-04-comments-ownership.json
  - ../review-records/2026-09-09-comments-package-data.json
```

The decision body states the current conclusion and its evidence limits. Its
record preserves the dated reasoning. `current_review` selects the effective
conclusion; it does not mean the implementation is complete. Update the
existing index and log after a material compilation.

### Feature entrypoints and plan associations

`features/<scope-id>.md` is generated by `render` and checked by `check` for
every scope. It links current decisions, execution, proof limits, classified
documents, candidates and chronological history. Edit the owning record, plan,
decision or index association, never the generated hub. The global ledger
retains the queue. [The docs guide](../README.md) explains folder authority.

`lookup <scope>` returns a compact decision/history summary and bounded changed
inputs. `lookup <scope> --detail` exposes full records and fingerprints. A
candidate document is a retrieval lead, not an adopted decision or proof.

New associated plans declare:

```yaml
review_scopes: [suggestions, authored]
review_basis: [2026-09-17-suggestions-authored-editing-final]
work_kind: implementation
```

Use one `Status:` line in the body for the plan lifecycle. The work kind is
`design`, `implementation`, `research`, `workflow` or `verification`. Completion
means completion of that job; a finished design cannot establish adoption.
Empty basis means no governing review is known, never implicit approval.

The index's `documents` contains inspected historical associations with `path`,
`scopes`, `kind` (`plan`, `decision`, `lesson`, `specification`, `report`,
`history`), `disposition` (`active`, `historical`, `superseded`, `candidate`) and
`rationale`. Historical plans can additionally carry `reviewBasis` and
`workKind`. Explicit plan metadata is authoritative; conflicting associations
remain visible. Record why the content answers this scope before associating.
Uninspected matches retain `candidate` disposition or `historyCandidates`.
Inspected false matches go in `rejectedCandidates` with `path`, `scopes` and
`reason`, so a later lookup does not keep suggesting the same irrelevant file.

### Record execution

Finish the plan's status and evidence before capturing its fingerprint:

```sh
node tooling/scripts/review-ledger.mjs draft-execution docs/plans/<plan>.md > docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/<outcome>.json
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

Execution uses the same append-only `review-records` store and checksum index:

```json
{
  "id": "2026-09-18-example-execution",
  "kind": "execution",
  "date": "2026-09-18",
  "scopes": ["suggestions"],
  "reviewBasis": ["2026-09-17-suggestions-authored-editing-final"],
  "workKind": "implementation",
  "plan": { "path": "docs/plans/<plan>.md", "sha256": "<SHA-256>" },
  "binding": "current",
  "outcome": "completed",
  "summary": "The precise implemented outcome.",
  "proof": {
    "state": "partial",
    "evidence": [{ "path": "<receipt>", "sha256": "<SHA-256>", "claim": "The bounded observed result." }],
    "limits": "What these observations do not establish."
  },
  "source": { "files": {}, "directories": {}, "features": {}, "upstreams": [] },
  "references": ["docs/plans/<plan>.md"]
}
```

The draft supplies actual fingerprints; placeholders above are explanatory.
`outcome` is `completed`, `partial`, `blocked` or `abandoned`. Proof is
`verified`, `partial`, `unverified` or `unknown`. A current binding requires
governing review coverage of its scopes and matching source, plan and evidence
when recorded. Capture decision-critical fixtures and runners as well as
implementation; a matching hash establishes identity, not a passing test.
Cross-feature plans can have several governing reviews. If any scope lacks a
governing decision, keep the outcome unbound rather than borrowing an unrelated
review. An execution's scope and basis must agree with its plan association.

Use `binding: historical-unbound`, `source: null` and unknown proof for imported
completion claims without recoverable original bindings. Retain the claimed
outcome and original references, but do not mint current fingerprints as if
historical commands had run against them. Missing evidence and changed inputs
stay explicit. A later source change makes a bound receipt stale; it never
rewrites the receipt or proves a regression by itself.

After recording, reconcile the mutable decision's progress and add the outcome
ID to `reconciled_executions`. Keep `current_review` pointed at the governing
design. A completed plan without a bound outcome and an outcome absent from
the decision summary are visible tracking gaps. Plan edits require another
outcome; immutable reviews and execution records are never rewritten.

### Reuse research

`research <key-or-term>` searches all immediate dated Plite run directories'
repository, query, read, lead, rejection and promotion TSVs. Output preserves
each original header, path and line. An exact `status` column takes precedence;
an absent status stays null instead of borrowing a decision column. Malformed
rows return their original header and cells, a null parsed row/status, and a
warning. Shifted columns are never presented as a valid status.

For broad terms, redirect the JSON result to an artifact and inspect bounded
matches instead of streaming every source row into the conversation.

Search by semantic lead key and relevant terms. This command locates evidence;
it cannot decide semantic equivalence. Reuse a read only when question, source
version and dependencies match. Preserve rejection reasons and reopening
conditions. Future ledgers add `scope_id`, `review_id`, `source_revision`,
`source_fingerprint` and `checked_at` where applicable without replacing their
existing required columns. External audit architecture, test and issue cursors
remain separate under [Editor Audit](../editor-audits/index.json).
