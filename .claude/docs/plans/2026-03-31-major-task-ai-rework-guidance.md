# Major-Task AI Rework Guidance

## Goal

Explain how to use the new `major-task` workflow for an AI/editor rework in this repo, grounded in the newly added `major-task` skill and the editor comparison map.

## Source Of Truth

- User request in thread
- `.agents/skills/major-task/SKILL.md`
- `.claude/docs/analysis/editor-architecture-candidates.md`

## Task Classification

- Lane: framework comparison or migration
- Work type: analytical only
- Browser surface: none required
- Expected outcome: concrete recommended prompt/workflow for running `major-task`

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load relevant skills and context | complete | Loaded `major-task`, `planning-with-files`, `repo-research-analyst`, `learnings-researcher` |
| Read core docs | complete | `major-task`, editor candidate analysis, CE tree, and AI streaming notes |
| Distill workflow | complete | Turned repo guidance into concrete usage rules |
| Respond with recommended prompt | in_progress | Include what to compare and what outcome to ask for |

## Findings

- `major-task` is for heavyweight architecture, framework comparison, migration, benchmark, or proposal work.
- For editor-framework-facing work, it explicitly says to start from `.claude/docs/analysis/editor-architecture-candidates.md`.
- The candidate doc is an opinionated shortlist, not a full market scan.
- Priority comparisons start from `Plate vs Slate`, then broaden to `ProseMirror`, `Lexical`, `Tiptap`, and `Pretext/Premirror` based on the actual decision.
- The CE tree says `major-task` is the heavyweight lane and should selectively pull helpers like `repo-research-analyst`, `architecture-strategist`, `performance-oracle`, and `spec-flow-analyzer` instead of defaulting to every reviewer.
- For AI/editor work in this repo, there is already local design pressure to keep `AI raw chunks -> joiner -> streamInsertChunk -> correct Plate editor state` as the contract.
- Existing AI notes already push toward localized preview rollback and `tf.ai.*` lifecycle transforms instead of broad editor-value replacement.
- A good `major-task` prompt here should ask for facts, inference, and recommendation separately, and should ask for a narrow candidate set rather than a market-wide survey.

## Open Questions

- Whether the user's "AI rework" is primarily runtime/editor architecture, AI service architecture, or product UX around AI tools.
- Whether the intended output is a decision memo, implementation plan, or migration proposal.
- Whether the decision is mostly about Plate-vs-other-editor architecture, or about cleaning up Plate's current AI streaming internals without changing the editor substrate.

## Progress Log

- Created plan doc for this guidance task.
- Read the new `major-task` skill after merging latest `main`.
- Read the editor architecture candidate analysis to align the recommendation with repo intent.
- Read Plate's CE tree analysis to confirm which helper agents belong in the `major-task` lane.
- Read recent AI streaming and preview notes so the recommendation stays grounded in current Plate constraints.
