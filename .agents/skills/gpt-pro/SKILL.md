---
description: Create a self-contained GPT Pro or external-review prompt with full repo context, current state, evidence, and pointed review questions because the reviewer has no local file access.
argument-hint: '[topic | plan path | review target | prompt request]'
disable-model-invocation: true
name: gpt-pro
metadata:
  skiller:
    source: .agents/rules/gpt-pro.mdc
---

# GPT Pro

Handle $ARGUMENTS.

Use this when the user wants a paste-ready prompt for ChatGPT Pro, GPT Pro, or
another external reviewer/model. The external reviewer has no repo, terminal,
browser, or local file access, so the prompt must include enough current,
source-backed context to reason independently.

This skill borrows the rigor of `ralplan-creator`, but its output is a prompt,
not a local execution plan.

## Use When

- The user says `gpt-pro`, GPT Pro, ChatGPT Pro, external review, ask another
  model, or send this to ChatGPT.
- The user wants "full current state", "review the direction", "ask questions",
  "best solution", or "harsh review" from an external model.
- The task needs source-backed context, benchmark evidence, API shape, or
  architecture skeleton that the external model cannot inspect.
- The user wants a review prompt for a plan, API rewrite, architecture decision,
  benchmark result, research direction, migration, or public-facing design.

## Do Not Use When

- The user asks to implement the plan locally.
- The user wants a normal `ralplan`, `ralph`, code review, or bug fix.
- A short answer in chat is enough.
- The external reviewer already has direct repo access.

## Hard Policy

- Output a prompt, not an implementation plan, unless the user explicitly asks
  for a local plan file.
- Assume the reviewer has zero local access. Never write "read this file",
  "inspect the repo", "run the benchmark", or "see the branch" as a required
  step for them.
- Include all necessary local context inline: source paths, API skeletons,
  behavior flow, docs claims, test/benchmark results, prior decisions,
  constraints, known gaps, and the exact question to answer.
- Do not invent current state. Read live files, docs, tests, benchmarks, plans,
  and sibling repos before summarizing them.
- Treat pasted old prompts and previous model answers as context, not truth.
  Refresh against the current repo when feasible.
- Label facts clearly: `confirmed`, `benchmarked`, `inferred`, `stale`, or
  `gap`.
- Prefer exact paths plus concise summaries over huge code dumps.
- Quote only the smallest snippets needed to prove API shape or behavior.
- If evidence is missing, say that in the prompt and ask the reviewer what would
  change their verdict.
- Force a decision. Ask for a harsh verdict, rejected alternatives, red flags,
  pass/fail gates, and the evidence that would overturn the recommendation.
- Latest user intent wins over pasted context.

## Read First

Read only what the prompt needs, but the prompt must be self-contained.

1. The latest user request.
2. Any named plan, state file, doc, source file, issue, benchmark, or sibling
   checkout.
3. Current local source that owns the API/behavior.
4. Current tests, examples, benchmark runner, or proof artifact for the claim.
5. Existing active plan or completion file when the prompt is about active work.
6. Relevant research docs or local sibling repos when ecosystem comparison is
   part of the ask.
7. Previous external answer only after local state has been grounded.

If the prompt concerns performance or current behavior, prefer fresh benchmark
or test output when practical. If fresh proof is too expensive, say exactly
which numbers are stale or memory-derived.

## Workflow

1. Restate the decision or review question in one sentence.
2. Gather the minimum local evidence needed for the reviewer to reason without
   repo access.
3. Separate confirmed facts from assumptions, gaps, and previous opinions.
4. Extract the API or architecture skeleton:
   - public types or props
   - runtime flow
   - data model
   - extension points
   - source paths
   - proof/test/benchmark ownership
5. Summarize the strongest evidence, including numbers when relevant.
6. Name candidate directions and the one the local analysis currently favors.
7. Add pointed review questions that force tradeoffs, not generic advice.
8. Produce one paste-ready prompt.

## Prompt Contract

The prompt should usually contain these sections, adapted to the task:

1. Role and review standard.
2. Decision to make.
3. Current repo state.
4. Source-backed API or architecture skeleton.
5. Evidence: benchmarks, tests, docs, examples, or observed failures.
6. Prior decisions already accepted.
7. Constraints and non-goals.
8. Known gaps and red flags.
9. Candidate directions.
10. The direction we currently favor, if any.
11. Exact output requested from GPT Pro.
12. Review questions.

For architecture/API/performance prompts, request these outputs when relevant:

- harsh verdict
- recommended default or decision
- how to win the critical benchmark or quality lane
- what to steal and reject from comparable systems
- risk table
- benchmark or proof matrix
- implementation phases with hard gates
- maintainer objections and answers
- red flags that could invalidate the conclusion
- exact evidence that would change the decision

## Context Packing Rules

- Include full current-state context, not just links.
- Keep paths in the prompt so the answer can be mapped back to the repo.
- Use tables for metrics and side-by-side tradeoffs.
- Use snippets for API shapes and before/after examples.
- Do not paste large source files. Summarize behavior and include only the
  smallest decisive snippet.
- Include source-backed contradictions, especially stale docs versus fresh
  benchmarks.
- If sibling repos matter, include their behavior skeleton too. Do not ask the
  reviewer to inspect them.
- If the prompt uses a previous GPT Pro answer, include it as "previous answer"
  and ask the reviewer to critique or refine it against the new state.

## Quality Gates

Before finalizing the prompt, check:

- Can the external model answer without repo access?
- Does the prompt include the current API/behavior skeleton, not just goals?
- Are benchmarks/tests labeled with dates, commands, or source paths when known?
- Are stale claims marked stale?
- Are open questions sharp enough to produce a decision-grade answer?
- Does the prompt ask for tradeoffs and red flags, not encouragement?
- Is the local favored direction stated clearly enough to be challenged?

## Output

If the user names a target file, write the prompt there. Otherwise paste the
prompt in chat.

Use a short wrapper before the prompt only when helpful:

```md
Prompt below. Sources grounded from:

- ...
```

Then provide the prompt, usually in a fenced markdown block.

Do not create or update implementation files while using this skill unless the
user separately asks for that work.
