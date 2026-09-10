---
description: 'Slate v2 migration supervisor. Use for autonomous Slate/Plate migration work: Plate to Slate v2 migrations, API maps, stale Slate API removal, docs migration-guide repair, changeset repair, migration tests, examples, package DX proof, and self-repair of the migration workflow when gaps are found.'
argument-hint: <migration surface/objective> [full-loop | timed 1h|2h|overnight | batch-loop | repair <gap>]
disable-model-invocation: true
name: slate-migration
metadata:
  skiller:
    source: .agents/rules/slate-migration.mdc
---

# Slate Migration

Apply [the Plate workflow](../task/references/workflow.md) for plan, authority, proof and review ownership.


Handle $ARGUMENTS.

Use this when the user wants a full autonomous migration loop for Slate v2,
especially when migrating Plate code, examples, docs, tests, public APIs, or
changesets to the current Slate v2 shape.

This is the migration lane. `task autonomous` supervises broad quality loops and
`benchmark` owns measured performance work; `slate-migration` owns migration closure: API mapping, stale symbol removal,
guide updates, changeset truth, package proof, examples, docs, and missed
migration workflow repair.

## Core Take

A migration is not done when code compiles.

A migration is done when:

```txt
inventory -> API map -> migrate one owner -> prove behavior/types/docs
-> repair guide/changesets -> stale-symbol audit -> packet decision -> repeat
```

Every discovered migration gap updates the durable owner:

- runtime/package source when behavior is wrong;
- tests/oracles when proof is missing;
- migration guide when users need a documented step;
- changesets when package users need release-facing migration info;
- `VISION.md` when the gap is reusable taste;
- `.agents/rules/slate-migration.mdc` or its template when the loop missed a
  recurring expectation.

## Use When

- The user invokes `slate-migration`.
- The user asks to migrate Plate to Slate v2.
- Slate v2 migration docs or changesets are missing, stale, incomplete, or too
  vague.
- Public API removals, alias cuts, package moves, root/value shape changes,
  hook renames, transforms, history, DOM/React APIs, or examples need a
  source-backed migration path.
- The work needs many loops with queued stop checkpoints and a final changed
  list/review-attention handoff.
- A prior migration pass found a missing guide row, missing changeset, weak
  stale-symbol audit, or fake compile-only proof.

## Do Not Use When

- The user asks one local Plite bug fix: use `patch`.
- The user asks one public API decision before migration: use `best-api`; use
  `plite-plan` when the decision is substrate runtime/adoption.
- The user asks performance measurement or optimization unrelated to migration
  closure: use `benchmark`.
- The user asks broad behavior/quality automation unrelated to migration
  closure: use `task autonomous`.
- The task is only writing a package changeset for an already-understood diff:
  use `changeset`.
- The work is only a docs page unrelated to migration: use Plate Docs.

## Invocation Modes

Use the same mode semantics as `task autonomous`.

- **Full-loop mode:** default when no duration is given. Run one complete
  migration loop until a real stopping checkpoint or completion threshold.
- **Timed mode:** record the user's stated budget or deadline as an upper
  bound. Only an explicit minimum is a minimum. Select in-scope migration
  packets that fit with proof and cleanup; stop on completion or at the bound,
  recording unfinished proof without claiming closure.
- **Batch-loop mode:** stack soft stopping checkpoints and continue through
  safe migration owners.
- **Repair mode:** when arguments start with `repair <gap>`. Patch the
  migration workflow source owner so future runs catch the gap.

## Task Plan Contract

Reuse one Task file plan for non-trivial migration work. Apply the project's standing Autogoal request for long-running migrations. The helper below
creates a file; migration depth or a measurable outcome is not goal authority.

Plan objective:

```txt
Migrate <surface> to Slate v2; done when API map, source/docs/changesets/tests,
stale-symbol audit, and review gates pass; plan docs/plans/<path>.md.
```

When no suitable Task plan exists, create the file with the dedicated template:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template plite-migration \
  --title "<surface>"
```

Add packs only when the touched surface needs them:

- `--with docs` for docs-heavy migration authoring;
- `--with package-api` for public exports/package boundary changes;
- `--with browser` for examples or editor behavior routes;
- `--with agent-native` when the migration workflow skill/template changes.

The first checkpoint must copy every explicit prompt requirement into the plan:
scope, owners, non-goals, timing, stop rules, deliverables, verification,
changeset expectations, migration-guide expectations, and final handoff shape.

## Read-First Sources

For every migration run, read the smallest set that owns the current decision:

- latest user request and active Task plan;
- `VISION.md`;
- `content/docs/plite/migration.mdx`;
- current Plite public source under `packages/plitejs` and `packages/test`,
  plus the affected Plate adapter entrypoint under `packages/platejs`;
- target Plate package/example/docs owners under `packages/**`, `apps/**`,
  `docs/**`, or the named surface;
- `.agents/rules/changeset.mdc` before writing or repairing changesets;
- `.agents/rules/plate-docs.mdc` before repairing user-facing docs;
- relevant previous plans/research only when they are named or directly
  connected to the surface.

Current source beats memory, stale plans, generated docs, and old migration
notes.

## Migration Checkpoints

Each loop has one owner and one packet decision.

1. **Inventory:** list packages, imports, docs, examples, tests, and changesets
   in scope.
2. **API map:** map old symbols and public behavior to current Slate v2 source.
3. **Stale-symbol audit:** scan target owners for old Slate API, alias,
   package, value-shape, root, hook, history, transform, and DOM/React patterns.
4. **Patch packet:** migrate one owner or prove it already matches v2.
5. **Behavior/type proof:** run the narrow package, typecheck, test, Browser, or
   example proof that owns the migrated surface.
6. **Guide repair:** update the migration guide when a user-facing migration step
   was missing, ambiguous, or contradicted by source.
7. **Changeset repair:** update `.changeset` files when package users need
   release-facing migration info. Use the `changeset` skill. Do not write
   changesets for docs-only, skill-only, or internal-only work.
8. **Docs/API sync:** make current docs describe only the latest supported API,
   while migration docs may use before/after examples.
9. **Workflow repair:** patch this skill/template or another owning skill when
   the migration loop missed a recurring checkpoint.
10. **Review handoff:** update changed list, review-attention list, queued stop
    checkpoints, commands, and residual risks.

## Packet Ledger

Every migration packet records:

- owner package/docs/example/test;
- old API or gap signature;
- current Slate v2 target API;
- files changed or intentionally not changed;
- guide row decision: `not-needed`, `updated`, `deferred-with-owner`;
- changeset decision: `not-needed`, `created`, `updated`, `deferred-with-owner`;
- proof command and result;
- decision: `keep`, `revert`, or `quarantine`;
- next owner.

Do not call a migration packet done with compile-only proof when the surface is
browser-visible or user-facing.

## Migration Guide Repair

Repair `content/docs/plite/migration.mdx` whenever a migration packet
reveals:

- a missing old-to-v2 API map;
- a value/roots/state shape that users must understand;
- a hook/render/event/DOM/history/hyperscript migration step;
- a stale target API or fake alias;
- a docs example that would not compile against current public exports;
- a repeated Plate migration question that belongs in the guide.

Migration docs can use before/after language. Normal latest-state docs should
not use changelog voice.

## Changeset Repair

Changesets are migration truth for package consumers.

Before editing `.changeset/**`, read `.agents/rules/changeset.mdc` and inspect
the actual diff against the relevant baseline. Then:

- write only user-visible package deltas;
- include migration steps only when users must change code;
- use concise imperative release-note style;
- split by package according to the active changeset rules;
- do not describe internals, tests, or implementation diary;
- do not write a changeset for docs-only, skill-only, template-only, or
  internal-only migration packets;
- if a package changed but has no user-visible delta, record `not-needed` with
  reason in the packet ledger.

If a changeset is incomplete, repair it before final handoff. If the right
changeset depends on a user-only release decision, queue a stopping checkpoint.

## Plate To Slate v2 Migration

For Plate migration runs:

- treat Plate packages, examples, docs, and tests as the target surface;
- treat the transplanted Slate packages in this checkout as the current Slate
  authority;
- migrate package/runtime owners before app/example glue;
- remove stale compat aliases instead of preserving bad API shape;
- keep Plate docs latest-state except for explicit migration docs;
- run focused package type/tests first, then broader checks only when required;
- add or repair tests for every migrated behavior contract that could regress;
- update migration guide and changesets during the loop, not as afterthoughts.

## Self-Repair

If the migration loop misses a recurring expectation, patch the owner:

- missing migration guide checkpoint -> `.agents/rules/slate-migration.mdc` or
  `docs/plans/templates/plite-migration.md`;
- missing changeset audit -> this skill/template plus `changeset` only if the
  changeset rules were actually wrong;
- wrong source of truth -> this skill;
- weak proof command -> this skill or the owning package script;
- stale taste rule -> `VISION.md`;
- generic task lifecycle miss -> Task; repair Autogoal for lifecycle or checklist-retention gaps in goal-backed work.

After changing `.agents/rules/**`, run `pnpm install`, verify generated
`.agents/skills/**/SKILL.md`, and record the repair in the active plan.

## Stop Rules

Stop when:

- the migration completion threshold passes;
- the stated budget/deadline is reached, with the current packet safely
  checkpointed and its proof status recorded;
- an explicitly requested minimum has elapsed and the active packet is
  verified, reverted or quarantined;
- a required user taste decision is missing from `VISION.md` and no safe
  alternate migration work remains;
- a required publication action, external credential or destructive cleanup
  lacks actual user authority and no useful in-scope work remains.

Route public API decisions to `best-api` and runtime/adoption decisions to
`plite-plan` within the same Task. Existing execution authorization covers
these transitions. Do not invent new migration work to fill a timebox.

Do not stop because one package compiles while docs, changesets, stale-symbol
audits, or user-visible examples remain unchecked.

## Final Handoff

Report:

- goal plan path;
- migration surface and mode;
- packages/docs/examples/tests checked;
- API map summary;
- stale symbols removed or remaining;
- migration guide updates;
- changesets created/updated/not-needed;
- tests/typechecks/browser proof run;
- workflow repairs;
- changed list grouped by code, tests, docs, changesets, skills/workflow, and
  reverted/quarantined packets;
- `Needs your attention` ranked list;
- queued stopping checkpoints;
- residual risks and next owner.
