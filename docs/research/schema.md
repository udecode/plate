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
Feature groups may share one scope. Each member retains its disposition and
source fingerprint. The index records the inventory boundary and exclusions.

For a new proposal with no matching scope, add the semantic question and its
current comparison owners/dependencies to the index. A proposed scope can have
no current members. Its draft fingerprints the actual comparator dependencies;
proposed APIs are not counted as existing features or given invented paths.

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
| `adoption` | `not-assessed`, `planned`, `in-progress`, or `adopted`; only owning implementation evidence changes it |
| `proofState` | `not-replayed`, `partial`, or `verified`; only matching execution evidence changes it |
| record freshness | `matching`, `stale`, or `unknown`, computed from source identity; matching is not a behavior pass |
| `historyCandidates` | Filename-discovered plan links for intake, not inspected verdicts |

The inventory observes editable source, exported package entrypoints, copied
registry UI, and proof/tooling inputs. It also names every capability in the
canonical `PLUGINS` catalog, including marks and styles sharing one file, with
their literal property consumers. A catalog entry with no such read is a
declared capability, not proof of unreachable code; dynamic use is not ruled out.
Its count is feature/entrypoint groups, not independent reviews. See the index's
`inventory` fields for exact roots and exclusions. `discover` lists each
group's file count, fingerprint and source example. A new or removed group
fails `check` until explicitly reconciled. Changes within a group invalidate
its inventory fingerprint. `refresh` updates that observation without
altering any review or proof record.

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

The draft is not a verdict. It captures the scope and transitive dependency
fingerprints, current owner/consumer files, and durable law. Include any
additional decision-critical dependency or source observation. Complete:

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
- `references`, `proofLimits`: repository-relative evidence artifacts and the
  precise limits of source, behavior, browser and performance claims.
- `source`: SHA-256 file and feature fingerprints. Optional `upstreams` entries
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
review_history:
  - ../review-records/2026-09-04-comments-ownership.json
  - ../review-records/2026-09-09-comments-package-data.json
```

The decision body states the current conclusion and its evidence limits. Its
record preserves the dated reasoning. `current_review` selects the effective
conclusion; it does not mean the implementation is complete. Update the
existing index and log after a material compilation.

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
