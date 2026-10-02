# Agentic end-to-end testing against Plate's proof stack

Question: should Plate adopt `e2e` (tester-army/e2e, an agentic testing
framework with deterministic and agentic APIs for web and mobile), or the
mobile tools around it (agent-device, argent, stim, minisim), next to or in
place of its current proof stack? That stack is `@platejs/test`, the Bun unit
and DOM suites, the Playwright browser suites and the `verify` skill.

Scope: `proof`. Layer: Plate proof tooling, with Plite input and IME as the
behavior most at risk.

Triggers: the 2026-10-01 launch post by Oskar Kwaśniewski
(x.com/o_kwasniewski/status/2105675143464763540) and a user report pairing e2e
with pstack's verification skill for mobile
(x.com/stringsaeed/status/2105734077085303106).

Evidence gap: unit and DOM tests keep passing while real browsers show
caret and IME bugs, and the open autocomplete gates need physical Android,
iOS and screen-reader proof that nothing in the repository can run. The owner
does not want hours of Playwright suites either.

Stop rule: one shard each for the `e2e` source, the mobile tools, and Plate's
current stack and its drift evidence. Stop when each candidate has a
source-cited answer for what it can observe that the current stack cannot,
and at what cost.

Promotion owner: `best-api-review` for the verdict; `verify` for any adopted
proof lane.

Exclusions: no product code, no installs into the repository, no paid model
calls.

## Verdict

Keep Playwright and `@platejs/test`, and do not adopt `e2e` or the mobile
agent tools as proof owners (shards 001 and 002). `e2e`'s agent types with
`locator.fill`, never sees a collapsed caret, has no IME, clipboard or
held-key API, refuses URLs on mobile targets and sends telemetry by default.
None of the mobile tools types through the system soft keyboard by default or
reads page state in a mobile browser.

The drift comes from stand-ins inside green tests, not from too few or too
many end-to-end tests (shard 003). The browser suites take minutes. The harness
silently falls back to the page handle when native paste changes nothing,
sends shortcut chords as constructed events, and the mobile projects run
desktop engines with a phone profile. Twelve of twenty drift cases went red
only in installed or headed Chrome or with real OS input.

The cheapest lane that closes the Android class works today with tools the
repository already has (shard 004). Playwright attaches to Chrome for Android
over `adb` with no flags, real touches drive Gboard, and the existing model
oracle reads the page. On that lane Gboard did not compose at all, so the
emulated composition the suites assume is not what this keyboard sends.

The review record is `2026-10-02-proof-agentic-e2e-review`.
Page: https://claude.ai/artifact/37JKrrHdSBaCm78Kpz1m2k

The record landed on 2026-10-02 through a scheduled `draft proof --from` retry
after another session's in-flight probe file was removed.

## Counts

Each count comes from the ledgers in this directory.

- Sources read: 5 external repositories (`repo-registry.tsv`) plus this
  repository's proof stack.
- Reads: 278 rows (`read-log.tsv`).
- Leads kept: 37 (`lead-ledger.tsv`). Promoted: 2 (`promoted-ledger.tsv`).
  Rejected: 4 (`rejected-ledger.tsv`).

Next shard: none. The iOS Safari lane and screen-reader proof each need their
own probe, named in the review record.

## Plan

The plan this run fed is `docs/plans/2026-10-02-proof-device-lane.md`, page
https://claude.ai/artifact/1C5Axx5Aqg68Ly6zr2JkQo. Shards 005 to 009 were
added for it:
- 005 ranks the Android cases from Slate's issue history;
- 006 is the real IME path for #5137;
- 007 is the page-handle audit;
- 008 is the device-lane arena judge;
- 009 is the key map, composition and bypass prototype.

`review/` holds both interrogate passes.
