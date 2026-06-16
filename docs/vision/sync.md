# Vision Sync

`sync-vision` is the incremental lane for teaching root `VISION.md` and
`docs/vision/*.md` from accumulated human and agent inputs.

Root `VISION.md` stays the mandatory essential read. Detail files hold owner
doctrine that should not bloat the mandatory first read.

## State

- `docs/sync/vision/status.json` stores the committed baseline.
- `lastSyncedCommit` means every relevant committed input through that commit
  has been classified as `captured`, `reaffirmed`, `rejected`,
  `run-specific`, `owner-routed`, or `deferred-with-question`.
- Working-tree input is an overlay. It can be inspected in artifacts, but it is
  not baselined until committed.

## Classification

- `captured`: patch root `VISION.md` or the relevant `docs/vision/*.md`.
- `reaffirmed`: already covered by root or a detail file; record the section.
- `rejected`: stale, one-off, contradicted, or too specific.
- `run-specific`: belongs in the active plan only.
- `owner-routed`: belongs in a skill/rule, research doc, benchmark target,
  package docs, or behavior spec instead of vision docs.
- `deferred-with-question`: missing taste; queue one concise question and do
  not advance the baseline unless the committed range can be safely accounted
  for without it.

## Promotion Rule

Promote to root `VISION.md` only when the rule must be visible in the mandatory
first read: global taste, source order, cross-boundary law, essential Slate or
Plate direction, proof standards, or supervisor stop conditions.

Promote to `docs/vision/*.md` when the rule is reusable but only relevant after
a lane is selected.

Do not promote:

- temporary command output;
- one-off route state;
- old branch summaries;
- raw issue bodies;
- generated mirror noise;
- artifact paths;
- broad history that does not change a future decision.

## Baseline Advancement

Advance baseline only when all are true:

- committed diff range was collected from prior `lastSyncedCommit` to target;
- every candidate cluster has a classification;
- root or detail vision docs were patched or explicitly reaffirmed for
  reusable taste;
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

## Taste Gap Capture

Use root `VISION.md` or the relevant `docs/vision/*.md` as the durable target
for reusable taste discovered during automation stopping checkpoints.

Capture a new taste rule when:

- the automation loop stopped because the next safe move depended on user
  taste;
- the user answered the checkpoint;
- the answer changes future routing, proof, API, architecture, perf, docs, or
  handoff behavior beyond the current run.

Do not capture one-off project facts, temporary route state, exploratory packet
history, file lists, old branch summaries, or preferences already covered by an
existing rule.

Capture shape:

- write one compact latest-state rule in root or the smallest matching detail
  file;
- add an example trigger under correction patterns when wording matters;
- keep evidence and raw answer text in the active goal plan.
