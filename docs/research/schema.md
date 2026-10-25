# Research Schema

This is the minimal schema for the research layer.

Keep it small. The goal is consistency, not ceremony.

## Required By Page Type

### `sources/*`

An area page under `sources/<home>/` takes no frontmatter: a `# Home: topic` title, then `##` sections of `- **Title** text` findings, each naming its evidence. A home's README indexes its pages. A summary page that predates the homes keeps this frontmatter:

```yaml
title: ...
type: source
status: stub | partial | strong | stale
source_refs:
  - ../raw/...
updated: YYYY-MM-DD
```

### Open questions

An open design question has no page of its own. It is a chips `decide` task, as the Verdict playbook's Topics says, naming its owner and the evidence that would close it. A hard cut's question is the exception and gets a scope file.

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

The review ledger holds one scope file per review question. Verdicts live in review-page front matter and, for reviews before the front-matter cutover, in the legacy records; adoption lives in plan front matter, `Status:` lines and legacy executions; freshness compares what each review read with the commit it read, or with a legacy record's stored digests; history lives in git. `node tooling/scripts/review-ledger.mjs` reads all of it and writes nothing; nothing in it is generated or committed as a view.

| File | Holds | Written by |
| --- | --- | --- |
| `review-scopes/<scope>.json` | One semantic question, its queue fields, review inputs and member source | People and agents |
| `review-records/<id>.json` | The reviews and executions recorded before the front-matter cutover, read as history | Nobody |
| `review-groups.json` | Core review groups | People and agents |
| `review-documents.json` | Classified plans, decisions, reports and rejected matches | People and agents |
| `review-legacy.json` | The original order of the 487 oldest records, which orders their imported executions | Nobody |

Stable scope ids identify the user question across package and symbol renames. Plan front matter and plan pages key on them.

### Scope files

```json
{
  "id": "table",
  "title": "Tables and cell selection",
  "question": "What owns table topology, cell coordinates, selection, clipboard and layout?",
  "dependsOn": ["selection"],
  "prerequisiteReason": "Document topology and location rebasing constrain cell coordinates and table selection.",
  "owners": ["packages/platejs/src/features/table/"],
  "members": ["packages/platejs/src/features/table/", "apps/www/tests/browser/table-selection.spec.ts"],
  "consumers": ["apps/www/src/registry/components/editor/table.tsx"],
  "proof": ["packages/platejs/src/features/table/lib/BaseTablePlugin.apply.spec.tsx"],
  "evidenceInputs": ["apps/www/playwright.config.ts"],
  "relatedScopes": ["clipboard", "geometry"],
  "historyCandidates": ["docs/plans/5065-fix-table-tab-navigation.md"]
}
```

- A path ending in `/` is a directory and covers every file under it; any other path is one file.
- `members` is source membership: a file belongs to every scope whose `members` name it or one of its directories. A file can belong to several scopes. Membership routes lookup and coverage; it is not a review verdict.
- `owners`, `consumers`, `proof` and `evidenceInputs` are what a review of the scope reads. Name actual owners, materially different consumers, selected proof and decision-critical shared contracts, fixtures and runners. An empty `proof` list needs `gaps` saying why; an unrelated test cannot fill it.
- `dependsOn` names the scopes whose answers this one builds on and needs `prerequisiteReason`; `ship` names each one still open in the item's finding. `relatedScopes` supplies context only; it never adopts a verdict.
- `group` names an entry of `review-groups.json`. A group reviews its member questions together; each question keeps its own reviews.
- `historyCandidates` are filename-discovered plan links for intake, not inspected verdicts.

A scope's deep review creates its scope file when a design-question chip whose `writes:` names that file starts it, and a deep verdict that another playbook runs on a target no scope owns adds one for that target. A verdict intake creates none, and a hard cut's question gets a scope file only from the deep session of its `decide` chip. A scope file holds the semantic question and its current comparison owners and inputs. A proposed scope can have no members; its `owners` and `evidenceInputs` name the real comparator files, which its reviews' freshness reads.

### Review and plan front matter

```sh
node tooling/scripts/review-ledger.mjs lookup comments
node tooling/scripts/review-ledger.mjs research 'comment'
```

A review page declares its verdict in front matter, with one `Status:` line in the body:

```yaml
review_scopes: [table]
review_basis: [2026-09-17-table]
verdict: pursue
review_commit: <full sha of the commit the review read>
review_inputs: [apps/www/playwright.config.ts]
review_upstreams: ['../tiptap@<full sha>']
```

A plan that executes reviewed work declares its association in front matter, with one `Status:` line in the body:

```yaml
review_scopes: [suggestions, authored]
review_basis: [2026-09-17-suggestions-authored-editing-final]
work_kind: implementation
review_commit: <full sha of the commit its proof read>
review_inputs: [<proof file>, ...]
```

The work kind is `design`, `implementation`, `research`, `workflow` or `verification`. Empty `review_basis` means no governing review, never implicit approval. `review_scopes: []` marks a plan that answers no review question. A historical plan without front matter can be associated through its `review-documents.json` entry; front matter wins when both exist.

- `review_scopes` names the review questions, the page's subject first, each once.
- `verdict` (`stop`, `pursue` or `defer`) makes the page a review of each of its scopes. A page that judges several scopes with different verdicts writes `verdict: [reads=pursue, state=stop]`, naming every scope once. A review's id is its file name without `.md`, and its date is the file name's date.
- `review_basis` on a review names the reviews it reconciles: the head `lookup` reported, every other head and, for a fork, both; `[]` only for a scope's first review. On a plan it names the review it executes. Every id names a review page or a legacy review of one of the page's scopes.
- `review_commit` is the full SHA of the commit whose tree the review or the plan's proof read; a review page needs one.
- `review_inputs` adds files the review read beyond its scopes' entries, such as decision-critical contracts, fixtures, runner configs or a plan's proof files; an entry starting with `!` drops a scope entry the review did not read.
- `review_upstreams` names each external checkout the review read as `<checkout>@<full sha>`.
- Any other front-matter key that starts with `review`, `verdict` or `work_kind` fails `check`, so a misspelled key cannot drop a page or plan out of the ledger unnoticed.

Correct a review with a later review page that names it in `review_basis`; naming a review reconciles it and adopts nothing. A Pursue whose target already landed is written as a Stop, with the landed work as evidence.

### Derived state

Nothing below is stored.

- **Head.** A scope's head is the review, a page with `verdict` or a legacy record, that no later review of the scope names in `review_basis`, or for a legacy record in `previous` or `reconciliation`. Imported historical records stand in only when a scope has no review. Two heads are a `fork`, resolved by a review that names both; a fork that includes a review page fails `check`.
- **Adoption.** A Pursue closes when at least one implementation or workflow plan names it in `review_basis`, or the review page itself carries `work_kind: implementation` or `workflow`, and every such plan has one landed `Status:`. A page with `verdict` executes only its own Pursue; its `review_basis` reconciles and adopts nothing. A later plan on the same basis whose `Status:` is not landed, or a reopened `Status:`, reopens the Pursue. Legacy executions still adopt as they did: exactly one standing completed implementation or workflow execution, imported executions in their original append order, and `historical-unbound` imports never.
- **Open state**, checked in this order: `fork`; `unreviewed`; closed by Stop; `deferred`; closed by adoption; otherwise `pursue-not-adopted`, in progress when an open plan names the head.
- **Freshness.** `matching`, `stale` or `unknown`. A review page or plan reads `stale` when a tracked or untracked file under its scopes' owners, members, consumers, proof and evidence inputs, adjusted by `review_inputs`, differs from `review_commit`, or when a `review_upstreams` checkout's `HEAD` or working tree differs from its named commit. The decision page and the plan's own file count only when `review_inputs` names them. A page without `review_commit`, with a commit or upstream checkout this clone cannot reach, reads `unknown` unless something it names moved. Legacy records read from their stored digests, proof files and upstream checkouts as before. Changes to `VISION.md` and `docs/vision/` report a separate law clock that never makes a review stale. Matching is identity, not a behavior pass.
- **Coverage.** Source under the census roots that no scope's `members` name. The census is `git ls-files` within the roots, extensions and exclusions defined in `review-ledger.mjs`, so ignored and generated files stay out.

### Commands

| Command | Use |
| --- | --- |
| `status` | Open-state counts, the unowned-source count and each open scope with its verdict |
| `ship` | Each open scope except a deferred one, by id, as the JSON items `chips` offers as P1 tasks. An item writes the scope's subject file and owners, its finding names each open scope in `dependsOn`, and its `waits` hold `run:<plan>` for each active, held or planning plan that names the scope |
| `lookup <scope\|group\|path\|term> [--detail]` | Compact summaries; a term matches scope ids, titles, questions, scope paths and retired feature-group names; `--detail` adds full records, plans and documents |
| `show [scope]` | Markdown history of a scope, or every scope's open state, on stdout |
| `coverage [prefix]` | Unowned source and scope entries that match no file |
| `check` | Scope, group, document and legacy-record validity, and the front matter and body of every review page and plan under `docs/plans` against the shape the Verdict and Build playbooks give. Each error names the file and what to fix; warnings name legacy forks, conflicting status labels, unowned source, dangling entries and missing documents |
| `research <term>` | Search dated Plite research TSVs |

`check` reads only ledger files, the pages and plans under `docs/plans`, and git, so another session's source edits cannot fail it, except a page link or `review_inputs` path that neither the working tree nor any commit holds.

### Documents and candidates

`review-documents.json` lists inspected documents with `path`, `scopes`, `kind` (`plan`, `decision`, `lesson`, `specification`, `report`, `history`), `disposition` (`active`, `historical`, `superseded`, `rejected`) and `rationale`. Historical plans can add `reviewBasis` and `workKind`. Record why the content answers the scope before associating it. Uninspected matches stay in a scope's `historyCandidates`; inspected false matches are `rejected` with the reason, so a later lookup stops suggesting them.

A scope's subject file, `docs/plans/topics/<scope>.md`, holds its current conclusion in prose: its decisions with their rejected alternatives, its public calls, what other editors do and its open work. Each review page or plan on the scope is an iteration that folds into it when it closes. `lookup` names the subject file as `subject` but never reads it, so a fold never makes a review stale.

### Legacy records

The records written before the front-matter cutover keep their original shape and are history: nothing writes them, and a later review page supersedes one instead of editing it. The 487 oldest predate per-record digests and are read as follows:

- `source.files`, `source.directories`, proof evidence and upstreams compare against the tree as before. Directory digests keep their formula over git-listed files.
- `package.json`, `pnpm-lock.yaml` and the verdict skill and rule, which every old draft hashed, are not compared; `VISION.md` and `docs/vision/*` count toward the law clock.
- `source.features` digests are not evaluated, so the 356 records that carry them never read `matching`. Count them as the record files with a non-empty `source.features`.
- `plan.sha256`, `binding` other than `historical-unbound`, and `reconciliation[].question` are ignored.

### Reuse research

`docs/research/repos.tsv` lists each repo research saved or skipped, one row each: `repo` (lowercase owner/name), `url`, `clone` (relative to the plate root, such as `../tiptap`), `kind` (`editor`, `library` or `app`), `status` (`saved` or `skipped`), `areas`, `added` and `note`. It stores no last-read commit, because each lane keeps its own: the audit and harvest commits in [Editor Audit](../editor-audits/index.json) and the harvest indexes, and research's as the newest `<repo>@<commit>` an area page cites. `docs/research/areas.tsv` names each area with its `title`, review `scopes`, `aliases` and the `seeds` that `pnpm kb discover` searches. K16 checks both lists.

`pnpm kb <area | scope | repo>` joins them with every home's area page, the subjects and each repo's marks, and `pnpm kb discover <area>` prints the repos the seeds find that the list lacks.

The dated Plite runs under `docs/plite/research/` are frozen. `research <key-or-term>` searches all immediate dated Plite run directories' repository, query, read, lead, rejection and promotion TSVs. Output preserves each original header, path and line. An exact `status` column takes precedence; an absent status stays null instead of borrowing a decision column. Malformed rows return their original header and cells, a null parsed row and status, and a warning. Shifted columns are never presented as a valid status.

For broad terms, redirect the JSON result to an artifact and inspect bounded matches instead of streaming every source row into the conversation.

Search by semantic lead key and relevant terms. This command locates evidence; it cannot decide semantic equivalence. Reuse a read only when question, source version and dependencies match. Preserve rejection reasons and reopening conditions. New run ledgers add `scope_id`, `review_id`, `source_revision`, `source_fingerprint` and `checked_at` where applicable without replacing their existing required columns.
