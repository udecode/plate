---
extends: bug-fix
when: Use it for a Plate or Plite bug report, a regression, a screenshot or recording of wrong behavior, or "diagnose <report>".
---

# Bug fix

- **Before** "Reproduce it yourself on the matching surface via the driver skill": `udecode/plate` and `udecode/plate-private` issues run via `triage fix #<N>` / `triage fix plate-private#<N>` (`triage.md` Fix) unless already invoked by Triage Fix. Unfiled reports run directly only when failing on `next` (non-Beta `udecode/plate` issues report `main` and exit 1 in `triage claim`). Slate issues -> `maintainer slate-issue`; issue PRs -> `babysit.md` Issue PRs.
- **In** "Reproduce it yourself on the matching surface via the driver skill": transcribe recordings via `video-transcripts`, keeping exact route, input and expected result. Read failed browser spec results before rerunning (`verify` Drive). "Regression vs main" reproduces on `main` in a detached worktree first, then here, naming the breaking commit.
- **In** "Binary-search the cause": read matching `docs/research/sources/plate-notes/` pages first. Tighten to seconds (pinned time, seeded randomness) and test one falsifiable hypothesis per probe. Find the introducing commit (`git log -L`, `blame`, `bisect`), verify against its parent, and cite optional `Introduced-by: <sha>` when known.
- **After** "Binary-search the cause": `diagnose` stops here with cause, evidence and introducing commit.
- **In** "Plan the fix": fix at the owning layer (Plite substrate vs Plate policy), never caller workarounds (`best-api` if required inputs force dummy callers). Widen any covering formal check until it fails before fixing (or build an M6 check per `triage.md`). Sweep finds (`verify` sweep) get the lowest-layer test tagged `[plate#N]` / `[plate-private#N]` (+ `[EDIT-...]`) covering the full issue/repro (Plate browser tests in `apps/www/tests/browser/regressions/`) and `covered-by:` (path, title, `pnpm kb <tag>` hash) in the sweep plan.
- **After** "Verify on the same surface":
  - Browser-visible fixes run `verify` Hand drive after the last edit (`hand-drive.mjs check` log).
  - **Failed-fix recovery:** a reported-done fix failing exact replay, stability or retest (once the reporter assertion runs; fix crashing proof hosts first) revokes green claims and freezes product bytes. Classify the failure (nondeterminism, interaction delivery, host readiness or oracle sampling) before editing; for native selection, focus, popup/toolbar, mounted keyboard/semantic commands or exact routes, run `verify`'s [failed native diagnostics](../rules/verify.mdc#failed-native-diagnostics) first. Repair the proof gap at its owner and restart from exact repro. On the **2nd failed fix**, or immediately for cross-layer compensation, duplicate live identity, per-node hot work, focus timers or UI repairing substrate, run `pstack:recall` (no time window) then `verdict` on the owner before another attempt (prefer deleting/merging owners).
  - Grep-remove uniquely tagged debug probes and throwaway harnesses; add `changeset` if a published package changed.
- **Replace** "Stage the commits so the failing repro lands before the fix": land test and fix together via `land.mjs` (never a failing commit).
- **Replace** "Run **Opening a PR**": run diff panel if `reviews` or user asks; deliver via `land.mjs`.

## Redesign runs

Multiple failure kinds on one owner (from generated checks, repros or 2 verified distinct-cause critical diff findings) trigger `pstack:recall` + `verdict` immediately and start a redesign run (owner's word, 2026-10-21). Log `redesign run:` (`verdict`/`owner` phase) or `separate owners:` (semicolon-separated) for distinct owners; plan reviews log `plan round:`.

1. **Expected-results table first:** starting doc, ordered ops (retype, move, reload, later edit) and expected doc, ranked P0/P1/P2 (`triage fix` claimed kinds >= P1; unruled cases use `look` Defaults; removals follow `architecture.md` Hard cut). Reconcile editor-behavior rows into `docs/editor-behavior/markdown-editing-spec.md` at close.
2. **Test against the table:** assert in the area's generated check (outside blocking suite; parallel fresh-seed rounds up to `time.md` 1h cap, logging `inconclusive` + next range if capped); add one suite test per fixed mode.
3. **Design once for all P0/P1 rows:** `architect` (or arena) orders crash-first slices (owner/stored-shape changes require Pursue or owner ask); panel reviews plan before slice 1.
4. **Land slices via `land.mjs`:** each slice logs `built:` once it fixes a P0/P1 row (or prerequisite) without breaking passing rows.
5. **Findings -> rows:** new findings/seed hits take `next`'s result unless set in step 1; pivot via `architect` only if the finished design cannot meet a P0/P1 row.
6. **Counted work:** judge frozen speed budgets by counted units (miss >= P1). Done when all P0/P1 pass (P2 -> Open work).

## Public packets, corpus and Pokayoke

- **Public issue packet:** classification, root cause, reporter-valid steps, owner, red proof, final ref/fingerprints, 5 retry-free warm runs (native selection/focus/DnD/paint/React DOM), browser/device proof or limit, architecture verdict, changeset, review status and caveats (`maintainer` truth gate governs public text).
- **Corpus/regression work:** one case at a time with live ordering; red candidate-local intake counts as a failed fix.
- **Pokayoke:** fix invariant + escape mechanism; one confirmed violation audits the entire governed area (enumerate and read every candidate). Compare working reference vs failing target across caller, config, request, response and result before declaring a blocker.
