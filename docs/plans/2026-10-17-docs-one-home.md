---
work_kind: workflow
review_commit: b98f8f70104e7203036c944852442a61df4246a0
---

# Docs: one current-state home per scope

Status: executed, waiting on your commit
Topic: knowledge
Playbook: plan

## Brief

### What changed?

Each feature's current state now lives in its subject file. The decision pages are gone. Their content folded into subjects, eight scopes got a new subject file, and the Slate-era pages moved to research history. Vision kept only rules that bind several features, so 24 one-feature rules moved to their subjects. A verdict may now challenge a Vision rule.

### What could go wrong?

A fact may have been lost where two pages merged; nobody reread every fold side by side, because you said fast. Old prose cites a retired page by its commit, so the link opens with `git show`, not a click. The subject folder keeps its odd name until the shared renderer can point elsewhere.

## Teach

Every feature, such as tables or undo, has a ledger scope. Today its current state is written in up to six places: the subject file the plan page renders, a decision page under research, a scope file, paragraphs in the Vision files, the behavior spec and many plans. They drift. The history decision page says undo returns a promise in its body and says the opposite in its first paragraph.

The plan page already has a model for this. A subject file holds the current state, and each review or plan is an iteration that folds into it when it closes. Decision pages are a second write path that skips that model.

This plan makes the subject file the one home. Verdicts and plans fold their conclusion into it. Decision pages fold in and go away. Vision keeps the rules that bind more than one feature, and its feature-level rules move to their subject.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where a scope's current state lives | Its subject file in the plans topics folder (look) | A new scopes folder now, which needs a change to the shared page renderer first | scopes folder | big |
| Removing dormant doc stores | Keep every store; your question showed probes, research runs and records are live | Remove the five small dormant ones | remove dormant | small |
| The behavior spec | Stays one file; subject files cite their spec IDs (look) | Split each feature's rules into its subject file | split spec | big |
| Decisions shared by several scopes | Each scope keeps its own part, and the part that binds them all goes to the first scope's file with links from the others | Keep the shared pages as their own subjects | shared subjects | small |
| The old Slate v2 decision pages | Move to research history, since none is a current conclusion | Fold them into today's subjects | fold slate | small |
| Paired trials and panels | Skipped, because you said fast | Run the workflow trial and a panel on the diff | full | detail |
| The knowledge page link | A new page at https://claude.ai/artifact/Cp3hdNMXy9EvTQR7MQaNu3, because the old one at https://claude.ai/artifact/MNPJqJ9Rak3Da5efc1i9j1 no longer opens | Drop the new page and keep the subject unpublished | drop page | small |

## Scope

- In: `docs/research/decisions/` and its knowledge store folded into `docs/plans/topics/<scope>.md`; the scope files' `decision` key; the rules that write or read decision pages; the Vision preamble and its feature-level case law; a Verdict lane that challenges a Vision rule.
- Out: moving the subject folder, which needs `pageTopic` to name a subject directory in the shared renderer (suggested task); splitting the behavior spec; deleting any other store.

## Steps

### Slice 1. Write rules and the ledger link

- [x] 1.1 Point every rule that writes or reads a decision page at the scope's subject file: `.agents/playbooks/verdict.md`, `.agents/rules/research.mdc`, `.agents/rules/review-comment.mdc`, `.agents/rules/best-api.mdc`, `docs/README.md`, `docs/research/schema.md`, `VISION.md`'s preamble and `AGENTS.md`'s Source authority. Add the Verdict lane that names a governing rule as wrong. Proof: `git grep -n 'research/decisions' -- AGENTS.md .agents docs/README.md docs/research/schema.md VISION.md` prints only history, and `pnpm run prepare` then `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` exit 0.
- [x] 1.2 The ledger reads a scope's subject file where it read `decision`. Proof: `node tooling/scripts/review-ledger.mjs lookup history` names `docs/plans/topics/history.md`, and `node --test tooling/scripts/review-ledger.test.mjs` passes.

### Slice 2. Fold the decision pages

- [x] 2.1 Fold each one-scope decision page into its subject file as current state, creating the subject file where it is missing, and rewrite in place instead of stacking reviews. Proof: every scope whose `decision` named a page has a subject file holding its current decisions, and `node .agents/pstack/plan-page.mjs --index` renders every subject.
- [x] 2.2 Split the shared pages (`plite-core-ownership`, `plite-view-ownership`, `plate-core-ownership`) by scope, and fold the unlinked pages into their owners: authority pages into the spec's Authority section, feature pages into their subject, Slate v2 pages into `docs/research/history/`. Proof: `docs/research/decisions/` is gone, and prose citations of a retired page resolve through a `2e865a0bc4:` pin. A plan's `review_inputs` keep the bare path, which the ledger finds in history.
- [x] 2.3 `knowledge.mjs` drops the decisions class, and a word query searches each subject's body after its lead. Proof: `node --test tooling/scripts/knowledge/*.test.mjs` passes, and `pnpm kb check` and `review-ledger.mjs check` add no finding to the ones they report at `HEAD`.

### Slice 3. Vision keeps only shared law

- [x] 3.1 Move each feature-level bullet of `docs/vision/plite.md` and `docs/vision/plate.md` to its subject file's `## Rules` section, keeping the rules that bind two or more scopes. Proof: each moved bullet lands in one subject file, by a checked move list in the run directory, and `pnpm kb check` adds no finding.

### Close

- [x] Writing passes: `unslop` on the changed docs and rules; `deslop` and `no-comments` on the tooling diff.
- [ ] `pnpm lint:task` on the changed tooling files.
- [ ] Close written, subject file updated, page published.

## Proof

Logs go to `docs/plans/artifacts/2026-10-17-docs-one-home/` through `node .agents/pstack/proof.mjs`.

## Close

Every scope's current state now lives in its subject file. `docs/research/decisions/` is gone. Its one-scope pages folded into their subjects, eight scopes gained a subject file (commands, runtime, schema, state, geometry, native, selection and plate-api), the authority pages folded into the behavior spec, and the Slate-era pages moved to `docs/research/history/`. Prose cites a retired page as `2e865a0bc4:docs/research/decisions/<page>.md`. The ledger reads each scope's subject file, and the research, verdict, review-comment and best-api rules write there. `knowledge.mjs` and `kb.mjs` no longer index decision pages, and a word query searches each subject's body after its lead. Vision lost 24 bullets that bind one feature each. They now sit verbatim under `## Rules` in 13 subject files, and both Vision files say where such a rule lives.

Proof: the rule grep prints nothing, `lookup history` names `docs/plans/topics/history.md`, the ledger tests pass 49 of 49, the knowledge tests pass 98 of 98, the 24-row move list checks clean, `plan-page.mjs --index` renders every subject, and `pnpm lint:task` is clean on the tooling. The new ranking test fails on both broken rankings, lead only and body only. `pnpm kb check` and `review-ledger.mjs check` still exit 1, as they do at `HEAD`. This run adds no finding to either, and kb check drops from 52 K7 findings to 50. No panel, decision-trail review or reflect ran, because you said fast.

Counts: 9 boxes, 9 done.

Deviations: citations pin `2e865a0bc4`, the newest `next` commit holding the pages, instead of `b98f8f7010`. Plan `review_inputs` keep the bare retired path, because the ledger finds such a path in history and refuses a pinned one. The knowledge store for decision pages is removed, which the Out line now excludes from "deleting any other store".

## Open work

- Move the subject folder out of `docs/plans/topics/`, once the shared renderer's `pageTopic` can name a subject directory. owner: zbeyens. stop: a suggested task for the dotai renderer.
- Make `pnpm kb check` and `review-ledger.mjs check` pass. owner: suggested task t_3ea68f2e. stop: both exit 0 at `next`.
- Generated source indexes such as `docs/research/sources/plite/README.md` hold pinned lines until kb regenerates them from `docs/research/homes.tsv`. owner: zbeyens. stop: the next `research maintain` pass.
