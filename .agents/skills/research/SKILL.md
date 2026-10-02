---
description: Research prior art and external editor evidence for any Plate or Plite feature, picking the gap most likely to change a decision; compare external editor architectures through a strict source inventory; harvest portable tests from external editors; and maintain the compiled research layer.
argument-hint: '[audit | harvest | maintain | full] <topic, area or repo>'
name: research
metadata:
  skiller:
    source: .agents/rules/research.mdc
---

# Research

Handle $ARGUMENTS.

Research is a resumable evidence system, not chat browsing:

```txt
pick -> question -> registry -> queries -> leads -> read log -> score -> promote
```

It discovers and synthesizes. It does not run measured packets (`benchmark`), close an issue corpus row by row (`issue-harvester`, which also owns issue-by-issue closure after `harvest --issues`) or patch product code. `best-api` decides call shapes and `plate-architecture` plans adoption. Discovery never escalates into `audit` or `harvest` on its own.

## Modes

| Arguments | Does |
| --- | --- |
| `<feature or question>` | Picks the most valuable open research question for it, then runs a discovery run. |
| none | Picks the top item of `node tooling/scripts/review-ledger.mjs queue` that has no research yet. |
| `full <area>` | Ingests and compiles every relevant corpus into `docs/research` ([full pipeline](../../../docs/research/commands/full-pipeline.md)). |
| `maintain <area>` | Cleans an existing research lane: contradictions, freshness, backlinks, synthesis ([maintain](../../../docs/research/commands/maintain.md)). |
| `audit [--target <surface\|full>] <repo>...` | Compares external editor architectures with Plite and Plate through a complete source inventory and explicit extraction decisions ([editor audit](./references/editor-audit.md); full, all, exhaustive or multi-repository audits also read the [matrix](./references/editor-audit-matrix.md)). |
| `audit sync [all\|<audit-id>\|<artifact-path>]...` | Refreshes existing audits against new commits ([editor audit](./references/editor-audit.md)). |
| `harvest <repo> [--since <commit>] [--issues ...] [--apply] [<filter>]` | Harvests portable behavior evidence from an external editor ([test harvest](./references/test-harvest.md)). |
| `harvest plan <slate-v2\|plate> <report-or-repo-key>`, or `harvest <report> --lane <lane>` | Prepares a lane-specific adoption plan from a harvest ([test harvest](./references/test-harvest.md)). |

`audit` and `harvest` run only when typed or explicitly requested; read the named reference in full before starting. When the token after `audit` or `harvest` does not resolve to a repository, owner/repo, audit id or report, treat the arguments as a question.


## Pick what to research

1. **Layer.** Match the question to its owners in `VISION.md` and the Routing table in `AGENTS.md`: Plite for the model, operations, DOM, input, history and collaboration substrate; Plate for plugins, packages, docs, registry and product UX; both when the question crosses them.
2. **What is known.** Run `node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>` for the decision, its current review, limits and open questions, and `node tooling/scripts/review-ledger.mjs research <key-or-term>` for prior reads, leads and rejections. Read the matching compiled pages from `docs/research/index.md` and the candidates in `docs/analysis/editor-architecture-candidates.md`.
3. **The gap.** Choose the one question most likely to change a decision, in this order: an open question or `defer` limit on the decision page; a candidate editor or library not yet compared for this feature; a rejected lead whose reopen condition is now met; evidence whose source changed since it was read.
4. State the pick, its layer and why it beats the next candidate, then start the run.

Reuse a matching read or lead instead of repeating it. Compare the question, source revision, dependencies and reopening condition first; a new source can support an existing lead without creating another. Unknown historical provenance needs inspection before reuse. A lookup never advances Editor Audit's architecture, test-harvest or issue-refresh cursors.

## Discovery run

Record the question and scope, stop rule, artifact path, expected promotion owner, current local evidence gap and explicit exclusions before the first search.

Search the web and GitHub (code search, issues, PRs, discussions, examples, benchmark harnesses, browser test fixtures, commit history). Go beyond the usual three editors when relevant: ProseMirror, Lexical, Tiptap, CodeMirror, Milkdown, Remirror, Monaco, Quill, document editors, browser editor test suites, pagination and virtualization libraries, and TypeScript-heavy runtimes. Use ProseKit for headless extension composition, framework adapters, autocomplete and editor UI prior art, and Meowdown for hybrid Markdown, hidden-syntax caret and selection behavior, touch input, IME and WebKit proof ideas. Separate what those projects own from what they inherit through ProseMirror; Meowdown's desktop WebKit and touch-emulation tests are scoped browser evidence, not iOS proof.

Web and GitHub hits are leads only. Inspect the real source locally before any code-level claim, and never patch from snippets, titles, READMEs or discussions. Extract invariants, test cases, API shape, benchmark technique, architecture pressure and browser proof strategy; write Plate- or Plite-native code, never copied code.

### Artifacts

Each run lives in `docs/plite/research/<date>-<topic>/`, for either layer, because the ledger helper reads that directory:

```txt
README.md              # question, scope, stop rule, current verdict
repo-registry.tsv      # repo_key, url, host, license, stars_or_signal, last_activity, topic_tags, local_path, status, score, notes
query-ledger.tsv       # query_key, surface, query, filters, result_count, sampled_count, new_repo_keys, new_lead_keys, next_query
lead-ledger.tsv        # lead_key, repo_key, source_ref, topic, claim, evidence_grade, novelty, applicability, proof_owner, next_action, status
read-log.tsv           # source_ref, repo_key, kind, path_or_url, lines_or_id, read_reason, takeaway, lead_key
rejected-ledger.tsv    # dedupe_key, repo_key, lead_key, reason, reopen_condition
promoted-ledger.tsv    # lead_key, packet_id, owner, test_or_benchmark, verification_command, decision
shards/NNN-<theme>.md  # one bounded batch summary each
sources/               # tiny excerpts and metadata, not dumps
```

New lead, read and promotion rows also record `scope_id`, `review_id`, `source_revision`, `source_fingerprint` and `checked_at`, with `unknown` for unavailable provenance. Historical headers and rows stay as they are. Cloned repositories and bulk corpora live in `../raw`; small raw notes a run cites go in `docs/research/raw/<date>-<topic>/`. Never stream bulk results into chat: the ledgers are the state, and a run resumes from `query-ledger.tsv` and `lead-ledger.tsv`.

Keys: `repo_key` is the normalized lowercase `host/owner/repo` without `.git`; `query_key` is a slug of surface plus normalized query; `lead_key` is `<topic>:<normalized invariant>:<proof family>`, independent of repo; `dedupe_key` is the normalized problem signature, such as `selection:projected-native-double-highlight:visual-oracle`. Before reading a repo deeply, check the registry for its `repo_key` and the lead ledger for the same `lead_key` or `dedupe_key`; add support to an existing lead, read a rejected lead's `reopen_condition` first, and reuse an existing clone.

### Shards

Work in batches of about 10-20 repos, 20-40 issues or PRs, or one theme, whichever is smaller. Each shard gets a summary with its scope, sources sampled, top, rejected and duplicate leads, score changes and next query. Update the ledgers after every shard, and stop a shard early when it yields a concrete proof packet.

### Grades and scores

- `A`: local source inspected, plus a runnable test or benchmark idea or exact source behavior.
- `B`: an upstream issue, PR or test discussion detailed enough to map an invariant.
- `C`: docs, a blog or an example that suggests a pattern needing local validation.
- `D`: a search result, README claim or vague discussion; it only chooses the next source.

Score leads, not repos, on impact, novelty, applicability, proofability and risk, each `0-3`. Promote when `impact + novelty + applicability + proofability - risk >= 7`, or when a lower-scoring lead matches a current user-reported bug. The score ranks investigation only; it never justifies machinery or scores a target architecture. Prefer test, oracle and benchmark-method leads over runtime rewrites unless the runtime owner is already proven.

### Promotion

A lead becomes exactly one of:

- `test-packet`: a native unit, Playwright or Browser oracle with its verification command;
- `benchmark-packet`: a metric or harness repair with a target and before/after command;
- `plan-packet`: a `best-api` verdict on the call shape, plus an `plate-architecture` row when runtime or adoption ownership is unclear;
- `docs-packet`: an accepted research note or current-state decision;
- `no-code-decision`: rejected or quarantined with its reason and reopen condition.

A likely fix becomes a Bug fix, Benchmark, oracle or plan packet with its baseline, proof gate and keep, revert or quarantine decision. A clean negative result keeps its artifact with the rejected leads and the next search angle. A material Stop, Pursue or Defer assessment is recorded through `best-api-review`; the compiled decision links that record and the raw run instead of copying rows.

The handoff counts repos searched and read, issues and PRs read, leads kept, merged and rejected, and packets promoted; lists the top promoted leads with `lead_key`, grade, owner and proof command, and the rejections that prevent repeated work; and names the next shard or `none` with a reason.

## Compiled layer (`full` and `maintain`)

Read `docs/research/README.md`, `index.md` and `log.md` first, then the mode's command doc. `docs/research` is the compiled layer and `../raw` the evidence layer; keep raw evidence, source summaries, decisions and open questions distinct, and update the layer itself, not only the chat answer.

A `full` pass scopes every relevant corpus, runs an official-source discovery step per corpus, reads the strongest local raw hits before calling anything missing, and closes each corpus in a per-corpus ledger: pages and raw paths inspected, files read, official entrypoints checked, strongest evidence, a disposition (`evidenced`, `raw gap`, `compile gap`, `synthesis gap`, `freshness gap`, `evidence gap`, `contradiction gap` or `structure gap`) and the next action. No corpus ends silent; thin or contradictory evidence becomes an `open-questions/` page, never fake law. A `full` pass that spot-checked one corpus of several is not `full`.

After changing the review index or recording a review, run the helper's `render` and `check` commands and update `index.md` and `log.md`. For backlog or closure status, read [ledger queries](./references/ledger-queries.md).
