# Sweep

Beta sweeps run rounds over `https://beta.platejs.org` beside `slatejs.org` and `platejs.org`. Agents drive pages first, a person confirms each find, and each domain is triaged into one issue per cause before fixing.

## Roles and handoff

- **Tester:** runs rounds, retests finds, runs [Triage a domain](#triage-a-domain), publishes drafted issues, records retests (`pnpm triage retest`), and runs `/pstack:maintain-verification-skill` after a round.
- **Fixer:** runs `triage fix <domain>` in priority order, syncs formal checks (`/pstack:maintain-formal-verification-skill`), and runs `/pstack:correct` on repeat miss classes.
- **Handoff:** Triage a domain offers one `chips` task per domain. The tester never cards fix tasks; run `node .agents/pstack/setup.mjs` from the main checkout to sync `refs/pstack/ledger`, and the fixer's `/chips all` claims it.

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

## Triage a domain

A domain is the review scope owning the demo. Triage once every page in the domain has a session (or blocked record) and every find is retested; file nothing before domain triage.

1. Gather confirmed finds, open `udecode/plate-private` issues, and Beta-milestone `udecode/plate` issues. Send spec questions and editor gaps to `verdict`. Set `regression: <ref-url>` when beta differs from its reference page.
2. Group into failure kinds per `.agents/playbooks/triage.md` (Sweep domains): owner (`path:line`), miss class, cheapest catching layer, priority (`P0`-`P3`), and one drafted issue per kind via `maintainer` issue-draft. The tester publishes drafts, closes duplicates, and runs `triage #<N>`.
3. Offer one fix-run task per `.agents/playbooks/triage.md` (`Offer fix runs`) for any regression, P0, or P1 kind (P2/P3-only new bugs go to Open work). Sync via `node .agents/pstack/setup.mjs`; never card from the tester's session.

## Rechecks

A recheck stays active until its `[plate#N]`/`[plate-private#N]` test is present, unskipped, and gated at the bug's layer (`pnpm kb plate#N`). A changed test hash requires proving the test fails at the fix's parent via `tooling/scripts/proof-worktree.mjs --expect-fail`.
