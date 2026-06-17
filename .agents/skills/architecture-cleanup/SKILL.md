---
description: Clean architecture, code shape, and AI-generated sludge across Plate and Slate with source-backed delete/merge/inline/split decisions, anti-confetti proof, and agent-navigation scoring.
argument-hint: '[surface | package | docs path | broad] [audit | loop | timed <duration>]'
disable-model-invocation: true
name: architecture-cleanup
metadata:
  skiller:
    source: .agents/rules/architecture-cleanup.mdc
---

# Architecture Cleanup

Handle $ARGUMENTS.

Use this as the repo-local architecture and code-shape cleanup owner. There is
no separate candidate-only wrapper. The job is to find, rank, and, when safe,
clean source-backed architecture sludge so the codebase is easier for humans
and agents to understand.

This is not `task`, not `maintainer`, not `slate-auto`, and not a generic
refactor license. It owns architecture cleanliness: delete, merge, inline,
simplify, hard-cut stale compatibility, or split only when the split earns its
keep.

## Use When

- The user invokes `architecture-cleanup`.
- The user asks to improve architecture, clean code, deslop AI-generated code,
  simplify modules, consolidate wrappers, find refactor opportunities, reduce
  agent navigation friction, or make tests/proof easier to own.
- A supervisor sees repeated friction: shallow wrappers, pass-through modules,
  vague helper names, duplicate proof/browser helpers, over-broad barrels,
  orphan tests, fake abstractions, public/private confusion, or one behavior
  requiring too many files to understand.
- A public issue/PR implies cross-package architecture, testability, or
  cleanup debt rather than one local bug fix.

## Do Not Use When

- The task is one normal patch: use `task`, `slate-patch`, or the package
  owner.
- The task is an accepted public API/runtime/product architecture plan:
  use `major-task`, `slate-plan`, or `plate-plan`.
- The task is measured Slate optimization state: use `slate-ar`.
- The task is internal Slate v2 quality/perf/browser/API supervision:
  use `slate-auto`, which may invoke this skill when architecture cleanup is
  the right packet.
- The task is public queue selection: use `maintainer`.
- The task is broad OSS/source discovery: use `slate-research` first.

## Read Order

1. Latest user request and active goal plan.
2. Root `VISION.md`.
3. Relevant detail files:
   - `docs/vision/common.md` for shared proof, automation, and routing.
   - `docs/vision/slate.md` for Slate substrate architecture.
   - `docs/vision/plate.md` for Plate framework architecture.
4. `.agents/AGENTS.md` for command and skill ownership policy.
5. Nearby source, tests, docs, package manifests, exports, and prior plan rows
   for the target surface.
6. `docs/analysis/editor-architecture-candidates.md` only when the surface is
   editor architecture and the current source does not settle the question.
7. External source only after local repo evidence is insufficient.

## Goal Contract

Use `autogoal` for non-trivial cleanup runs. If no active goal already exists,
create the dedicated cleanup plan:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template architecture-cleanup \
  --title "<cleanup surface>"
```

Add `--with agent-native` only when the work changes `.agents/**`, skills,
rules, prompts, or agent-facing actions.

The first checkpoint must copy the prompt into checkable rows. The plan must
record:

- surface and source roots inspected;
- explicit non-goals;
- source map and owner map;
- deslop inventory;
- candidate count target;
- agent-navigation score;
- action decision for every candidate: delete, merge, inline, simplify, split,
  keep, defer, reject;
- proof command or source audit for every accepted packet;
- keep/revert/quarantine result for every implementation packet;
- stop condition.

## Core Law

Do not split because a file is large. Split only when the new owner has:

- durable behavior or proof ownership;
- stable, specific name;
- focused proof command;
- source-owner oracle or test ownership when relevant;
- lower future agent navigation cost.

If a split creates more hops without clearer ownership, merge it back, inline
it, or reject the packet. File count is not architecture quality.

## Candidate Method

Use the repo's vocabulary. For Slate work, speak in terms of model,
operations, runtime, DOM/input, selection, history, browser proof, packages,
benchmarks, and public API. For Plate work, speak in terms of plugins,
wrappers, components, kits, registry, app-facing docs, and product UX.

Inspect at least five candidate areas unless the prompt names a smaller
surface. Every candidate gets three tests:

1. **Deletion test:** if deleting the module makes complexity disappear, it is
   probably shallow; if deletion spreads complexity across callers, it may be
   earning its keep.
2. **Agent-navigation test:** count how many files/owners/proof commands an
   agent must touch to understand or fix one behavior.
3. **VISION fit test:** if the cleanup does not fit `VISION.md` or reusable
   taste is missing, route to `vision` / `sync-vision` before patching code.

Prefer source facts over vibes. A candidate needs concrete friction:

- shallow wrapper or pass-through module;
- duplicated branching, helper, proof, or selector logic;
- vague generic names that hide the behavior owner;
- public/private API confusion;
- over-broad barrel or package export;
- orphan test or stale source-owner oracle;
- tests forced through internals instead of useful interfaces;
- browser/proof logic copied instead of promoted;
- one behavior spread across too many files;
- perf or behavior work blocked by poor locality.

## Candidate Output

Record candidates in the active plan or a `docs/analysis/**` artifact:

| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Navigation score must include:

- files-to-read for one behavior;
- owners touched for one bug;
- proof clarity;
- public/private boundary clarity;
- net effect: easier, same, or worse for future agents.

Strength values:

- `Strong`: source-backed friction, clear owner, clear proof path, likely
  durable payoff.
- `Worth exploring`: real signal, but implementation shape or payoff needs a
  focused plan.
- `Speculative`: interesting pattern, but not enough evidence to spend churn.

Decision values:

- `delete`
- `merge`
- `inline`
- `simplify`
- `split`
- `keep`
- `defer`
- `reject`
- `plan`

Do not produce a menu of generic refactors. Every row must name files, source
facts, owner, proof path, and the cleanup action.

## Implementation Packet Law

This skill may implement a small cleanup only when all are true:

- behavior-neutral;
- no public API change;
- no product UX change;
- narrow source-backed owner;
- focused proof exists;
- source-owner oracle is added or repaired when ownership moves;
- packet can end keep, revert, or quarantine in the same loop.

Focused proof comes before broad proof. After multiple packets or import churn,
run the relevant broad gate. Never leave speculative cleanup dirty.

For behavior, public API, runtime boundary, product UX, or large blast radius:
stop at ranked recommendation and route to `major-task`, `slate-plan`,
`plate-plan`, `slate-auto`, or the package owner.

## Deslop Inventory

Always look for:

- wrappers whose names add nothing;
- one-use abstractions that should be inline;
- tiny files that force pointless navigation;
- helper modules split by accident rather than behavior;
- aliases and compatibility paths the current API should not keep;
- generated-looking repetition;
- stale docs/tests/oracles after ownership moved;
- over-broad barrels that leak internals;
- tests that assert old file locations instead of behavior/owner contracts.

Merge/delete is as valid as extraction. The default bias is simpler code, not
more files.

## Routing

- User explicitly asks architecture cleanup / deslop / simplify: use this
  skill first.
- `slate-auto`: may invoke this when repeated Slate quality/perf/test work
  proves architecture or cleanup friction.
- `major-task`: owns broad decision, rollout, and implementation plan when the
  cleanup has meaningful blast radius.
- `slate-plan` / `plate-plan`: own public API, behavior law, runtime boundary,
  or product architecture decisions after this skill identifies the problem.
- `maintainer`: may route public issue/PR architecture-cleanup candidates here
  before deciding execution owner.

## Stop Rules

Stop when:

- the next useful action is a public API/runtime/product architecture decision;
- the best cleanup has meaningful blast radius and needs owner review;
- proof requires unavailable browser, device, credentials, or external state;
- all inspected candidates are rejected/deferred/kept with source-backed
  reasons;
- a VISION/taste gap blocks confident autonomous cleanup.

Do not stop just because the first candidate looks plausible. Rank the set,
pick the cleanup action, then either implement a safe packet or route the
owner.

## Final Handoff

Report:

- source roots inspected;
- candidate count and top recommendation;
- delete/merge/inline/simplify/split/keep/defer counts;
- agent-navigation score changes;
- small packets applied with keep/revert/quarantine result;
- proof commands/source audits run;
- candidates rejected or deferred;
- needs-review list;
- next owner and exact first command or file to inspect.

Keep it short. The user should understand whether the repo got cleaner, not
just bigger or smaller.
