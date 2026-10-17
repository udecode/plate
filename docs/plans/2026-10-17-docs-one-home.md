---
work_kind: workflow
review_commit: b98f8f70104e7203036c944852442a61df4246a0
---

# Docs: one current-state home per scope

Status: building: slice 1, the write rules and the ledger link
Topic: knowledge
Playbook: plan

## Brief

### What will change?

Each feature's current state lives in its subject file, so verdicts stop writing to separate decision pages. Vision keeps only rules that bind several features, and a verdict may challenge a Vision rule.

### What could go wrong?

A fact can get lost while two pages merge into one. Old plans that link a decision page point at a moved file. The subject folder keeps its odd name for now.

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

## Scope

- In: `docs/research/decisions/` folded into `docs/plans/topics/<scope>.md`; the scope files' `decision` key; the rules that write or read decision pages; the Vision preamble and its feature-level case law; a Verdict lane that challenges a Vision rule.
- Out: moving the subject folder, which needs `pageTopic` to name a subject directory in the shared renderer (suggested task); splitting the behavior spec; deleting any store.

## Steps

### Slice 1. Write rules and the ledger link

- [ ] 1.1 Point every rule that writes or reads a decision page at the scope's subject file: `.agents/playbooks/verdict.md`, `.agents/rules/research.mdc`, `.agents/rules/review-comment.mdc`, `.agents/rules/best-api.mdc`, `docs/README.md`, `docs/research/schema.md`, `VISION.md`'s preamble and `AGENTS.md`'s Source authority. Add the Verdict lane that names a governing rule as wrong. Proof: `git grep -n 'research/decisions' -- AGENTS.md .agents docs/README.md docs/research/schema.md VISION.md` prints only history, and `pnpm run prepare` then `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` exit 0.
- [ ] 1.2 The ledger reads a scope's subject file where it read `decision`. Proof: `node tooling/scripts/review-ledger.mjs lookup history` names `docs/plans/topics/history.md`, and `node --test tooling/scripts/review-ledger.test.mjs` passes.

### Slice 2. Fold the decision pages

- [ ] 2.1 Fold each one-scope decision page into its subject file as current state, creating the subject file where it is missing, and rewrite in place instead of stacking reviews. Proof: every scope whose `decision` named a page has a subject file holding its current decisions, and `node .agents/pstack/plan-page.mjs --index` renders every subject.
- [ ] 2.2 Split the shared pages (`plite-core-ownership`, `plite-view-ownership`, `plate-core-ownership`) by scope, and fold the unlinked pages into their owners: authority pages into the spec's Authority section, feature pages into their subject, Slate v2 pages into `docs/research/history/`. Proof: `docs/research/decisions/` is gone, and `git grep -l 'research/decisions/' -- docs/plans/*.md` citations resolve through a `b98f8f7010:` pin.
- [ ] 2.3 `knowledge.mjs` drops the decisions class. Proof: `pnpm kb check` and `node --test tooling/scripts/knowledge/*.test.mjs` pass.

### Slice 3. Vision keeps only shared law

- [ ] 3.1 Move each feature-level bullet of `docs/vision/plite.md` and `docs/vision/plate.md` to its subject file, keeping the rules that bind two or more scopes. Proof: each moved bullet lands in one subject file, by a checked move list in the run directory, and `pnpm kb check` passes.

### Close

- [ ] Writing passes: `unslop` on the changed docs and rules; `deslop` and `no-comments` on the tooling diff.
- [ ] `pnpm lint:task` on the changed tooling files.
- [ ] Close written, subject file updated, page published.

## Proof

Logs go to `docs/plans/artifacts/2026-10-17-docs-one-home/` through `node .agents/pstack/proof.mjs`.
