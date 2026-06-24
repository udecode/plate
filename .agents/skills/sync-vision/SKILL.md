---
description: Sync root VISION.md and docs/vision detail files from changed human and agent inputs. Use when the user invokes sync-vision, asks to evolve vision/taste from recent plans/docs/skills, wants vision docs updated from accumulated human answers, or wants only changed inputs since the last recorded commit analyzed.
argument-hint: '[status | preview | sync | advance] [scope]'
disable-model-invocation: true
name: sync-vision
metadata:
  skiller:
    source: .agents/rules/sync-vision.mdc
---

# Sync Vision

Handle $ARGUMENTS.

`VISION.md` and `docs/vision/*.md` are dynamic. Treat them like a brain: they
should learn from repeated human answers, agent misses, plans, docs, skills,
research, and review handoffs, then forget noise.

This skill is the incremental sync lane. It does not replace the `vision`
router. It keeps root `VISION.md` and relevant `docs/vision/*.md` detail files
current by analyzing only changed durable inputs since the last synced commit.
Root `VISION.md` stays the mandatory essential read. Detail files scale the
doctrine by owner.

## Autogoal Dependency

Use `autogoal` before mutable work. This is a derived autogoal workflow.

- Primary template: `docs/plans/templates/sync-vision.md`.
- Default flow: one-shot sync.
- Preview flow: one-shot planning, no vision-doc patch and no baseline
  advancement.
- Required evidence: command, artifact, source-audit, and N/A rows.
- `autogoal` owns lifecycle, first-checkpoint requirement extraction,
  completion semantics, output-budget discipline, and `check-complete.mjs`.
- `sync-vision` owns input-range accounting, candidate classification, root vs
  detail doctrine patch rules, status semantics, and baseline advancement.

Goal handle shape:

```txt
Sync vision; done when changed inputs are classified, vision docs are patched or reaffirmed, baseline semantics are recorded, and checks pass; plan docs/plans/<path>.md.
```

## State

Durable state lives in:

```txt
docs/sync/vision/status.json
docs/sync/vision/runs/<date>-<base>-to-<target>/
```

`status.json` fields:

- `lastSyncedCommit`: every relevant committed input through this commit has
  been classified as `captured`, `reaffirmed`, `rejected`, `run-specific`,
  `owner-routed`, or `deferred-with-question`.
- `lastSyncedAt`: when the baseline was advanced.
- `lastRunDir`: latest run artifact directory.
- `lastTargetCommit`: latest target commit analyzed.
- `pendingRunDir`: run with unresolved decisions, or `null`.

Never advance `lastSyncedCommit` merely because artifacts were written. Advance
only after the committed range is fully accounted for. Working-tree overlays
are visible in artifacts but are not baselined until committed.

Working-tree overlays include relevant untracked files. New doctrine docs,
plans, or rule files must be visible in artifacts before commit, but they are
not baselined until committed.

## Commands

- `status`: read `status.json`, current `HEAD`, committed diff count, and
  working-tree overlay count. No writes.
- `preview`: write run artifacts and recommendations. Do not patch vision docs.
  Do not advance baseline.
- `sync`: default. Write artifacts, patch root/detail vision docs for
  high-confidence reusable decisions, route non-vision owners, and advance
  baseline only if all committed inputs are classified.
- `advance`: update `status.json` to current `HEAD` only after the active plan
  proves the range is fully accounted for.

Use the helper for accounting:

```bash
node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --status
node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --dry-run
node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs
node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --advance --plan docs/plans/<plan>.md
```

The helper writes:

- `changed-files.tsv`
- `candidate-lines.tsv`
- `summary.md`
- `run.json`

## Input Scope

Analyze changed durable inputs, not the whole repo every time:

- `VISION.md`
- `docs/vision/**`
- `.agents/AGENTS.md`
- `.agents/rules/**`
- `docs/plans/**`
- `docs/sync/**` except `docs/sync/vision/runs/**`
- `docs/research/**`
- `docs/slate-v2/**`
- `docs/editor-behavior/**`
- `docs/solutions/**`
- `content/docs/**`
- other Markdown-like root docs when they appear in the changed-file list

Generated `.agents/skills/**` mirrors are not primary input when a source rule
exists. Use them only for sync audits.

## Classification

Every candidate line or theme becomes one of:

- `captured`: patch root `VISION.md` or the relevant `docs/vision/*.md` file
  with a compact latest-state rule.
- `reaffirmed`: already covered by root or a detail file; record the section.
- `rejected`: stale, one-off, contradicted, or too specific.
- `run-specific`: belongs in the active plan only.
- `owner-routed`: belongs in a skill/rule, research doc, benchmark target,
  package docs, or behavior spec instead of vision docs.
- `deferred-with-question`: missing taste; queue one concise question and do
  not advance the baseline unless the range can be safely accounted for
  without it.

Promote to root `VISION.md` only when the rule must be visible in the mandatory
first read: global taste, source order, cross-boundary law, essential Slate or
Plate direction, proof standards, or supervisor stop conditions. Promote owner
detail to `docs/vision/*.md` when the rule is reusable but only relevant after a
lane is selected.

Do not promote:

- temporary command output;
- one-off route state;
- old branch summaries;
- raw issue bodies;
- generated mirror noise;
- artifact paths;
- broad history that does not change a future decision.

## Sync Workflow

1. Load `autogoal`, create or continue a `sync-vision` plan, and copy every
   user requirement into checkpoint zero.
2. Read root `VISION.md`.
3. Read `docs/sync/vision/status.json`.
4. Run the helper in `status` or collection mode.
5. Read `summary.md`, `candidate-lines.tsv`, and the changed source files that
   actually contain high-signal candidates.
6. Cluster candidates by reusable decision, not by file.
7. Classify each cluster.
8. Patch root `VISION.md` or the relevant `docs/vision/*.md` only for
   `captured` clusters. Write current-state doctrine, not changelog prose.
9. Route owner-specific misses to the owner:
   - skill/rule miss -> `.agents/rules/**`, then `pnpm install`;
   - editor behavior law -> `docs/editor-behavior/**` or `slate-plan`;
   - Slate automation loop miss -> `auto`;
   - research system miss -> `slate-research`;
   - migration miss -> `slate-migration`;
   - benchmark truth -> benchmark target/script owner.
10. Record a decision ledger in the plan or run summary.
11. If `.agents/rules/**` changed, run `pnpm install` and mirror audit.
12. Run `check-complete.mjs`.
13. Advance `lastSyncedCommit` only when the committed range is fully
    classified.

## Baseline Advancement

Advance baseline when all are true:

- committed diff range was collected from prior `lastSyncedCommit` to target;
- every candidate cluster has a classification;
- root or detail vision docs were patched or explicitly reaffirmed for reusable
  taste;
- owner-routed items have concrete owners;
- deferred questions are listed with recommendations;
- generated mirrors are synced when source rules changed;
- the active plan passes `check-complete.mjs`.

Do not advance baseline when:

- the run is `status` or `preview`;
- a candidate changes product/API taste and no default can be inferred;
- a source rule changed but generated mirror sync failed;
- the helper reports a git/ref error;
- only uncommitted overlay input exists.

## Final Handoff

Include:

- base commit, target commit, and whether baseline advanced;
- changed input count and candidate count;
- root/detail vision doc changes;
- reaffirmed existing sections;
- rejected/noise clusters;
- owner-routed follow-ups;
- deferred questions;
- changed files;
- commands run;
- next `sync-vision` command.

Keep it short. The run artifacts hold the detail.
