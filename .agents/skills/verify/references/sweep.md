# Sweep

Beta sweeps run rounds over `https://beta.platejs.org` beside `slatejs.org` and `platejs.org`. Agents drive pages first, a person confirms each find, and clear blockers go straight to `udecode/plate-private`.

## Roles and handoff

- **Tester:** runs rounds, retests finds, files confirmed Beta bugs straight to `udecode/plate-private` (do not wait for an entire domain to finish before filing a clear P0 or P1 blocker), records retests (`pnpm triage retest`), and runs `/pstack:maintain-verification-skill` after a round.
- **Triage and queue:** `triage` groups open issues into failure kinds on `refs/triage/state`. Run `pnpm triage status` to see `unfixed`, `claimed`, and `ready to retest on beta`.
- **Fixer:** claims work via `pnpm triage claim --next --repo plate-private` (or `triage fix <domain>`), fixes claimed kinds together, syncs formal checks (`/pstack:maintain-formal-verification-skill`), and runs `/pstack:correct` on repeat miss classes.

## Pages and agent pass

- `node tooling/scripts/page-health.mjs --list` lists pages by tier (Slate, Plate, New Slate, New Plate) with reference URLs; run without `--list` at round start across Chromium, Firefox, and WebKit.
- Parallel Chromium agent lanes via `tooling/scripts/sweep-pass.mjs`:
  1. `node tooling/scripts/sweep-pass.mjs rows --pages --out <dir>/rows.json`
  2. `node tooling/scripts/sweep-pass.mjs plan --rows <dir>/rows.json --dir <dir> [--lanes <n>] [--lang en|zh]`
  3. Drive each lane brief (`lanes/L<n>.md`), saving `records/L<n>-<i>.json` and clips under `clips/`.
  4. `node tooling/scripts/sweep-pass.mjs collect --dir <dir>` validates records and writes `results.json` / `results.md`.
- Rotate Chrome, Safari, Firefox, and iPhone across rounds. Reserve physical device, OS IME, cross-app paste, and native drag checks for a person.

## The six moves

Build state instead of resetting; never click to repair lost focus. Apply live while watching caret, selection paint, focus, popups, and layout:

1. **then-type:** act, then type, Backspace, Enter, undo, and type without clicking.
2. **again-elsewhere:** repeat elsewhere, after Escape, and after undo.
3. **other-route:** trigger via keyboard, toolbar, slash/block menu, and paste.
4. **edge-start:** start at block/cell/mark edges, empty blocks, or beside voids/tables/images.
5. **inside-other:** repeat inside other block types and in suggesting/read-only mode.
6. **moved-ground:** repeat scrolled, inside scroll containers, or in narrow viewports.

Reproduce each find once in a fresh tab with a clip before logging (`mm:ss browser: what differed`).

## Filing and triage

1. For any confirmed P0 or P1 blocker, draft and file straight to `udecode/plate-private` via `maintainer` issue-draft (one issue per cause, with clip and `regression: <ref-url>` when beta differs from its reference page). Send spec questions and editor gaps to `verdict`.
2. Run `triage` (or `triage plate-private#<N>`) to group open `udecode/plate-private` and Beta-milestone `udecode/plate` issues into failure kinds on `refs/triage/state` (priority `P0`-`P3`, scope, optional owner `path:line`) and close duplicates.
3. Use `pnpm triage status` to track `unfixed`, `claimed`, and `ready to retest on beta`. Once a fix deploys to `beta.platejs.org`, run `pnpm triage retest plate-private#<N> --pass|--fail --on "<browser/device>"`.

## Rechecks

A recheck stays active until its `[plate#N]`/`[plate-private#N]` test is present, unskipped, and gated at the bug's layer (`pnpm kb plate#N`). A changed test hash requires proving the test fails at the fix's parent via `tooling/scripts/proof-worktree.mjs --expect-fail`.
