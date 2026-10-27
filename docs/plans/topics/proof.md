# Editor proof

Page: https://claude.ai/artifact/67Qh93t2kE15qfLRWrRHJ7

How Plate proves editor behavior that unit and DOM tests miss, through real
input and a model oracle that reads the page. Every plan for the `proof` scope
is one iteration of this subject; `node tooling/scripts/review-ledger.mjs show proof`
prints the scope's review history.

## Public API

A Playwright project names only its device. Harness pastes pick their own
path and fall back to the page handle when that path does nothing.

```ts
// apps/www/playwright.config.ts
{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
```

Native event traces record input and composition events.

```ts
// packages/test/test/proof/playwright-native-event-trace.test.ts
await startBrowserNativeEventTrace(locator, {
  events: ['beforeinput', 'input'],
});
```

A browser spec takes `test` and `expect` from the package, and that `test`
saves each editor's state when a test fails.

```ts
// apps/plite/tests/plite-browser/focus-blur.test.ts
import { expect, test } from '@platejs/test/playwright';
```

## Main changes

- Every mounted `Editable` attaches the browser handle, so production bundles
  carry it.
- Harness pastes have four silent fallbacks to the handle or a synthetic
  event, so a broken native paste can pass.
- Desktop IME proof uses CDP composition only; nothing drives an OS input
  method.
- Mobile coverage is Playwright device emulation. Nothing types on a real soft
  keyboard, and the raw-mobile receipt schema has no producer.
- Beta testing runs as a sweep, `.agents/rules/verify/references/sweep.md`.
  Agents test each page first and a person retests. Each domain's finds are
  triaged into one issue per cause and fixed in one run, which adds the check
  that would have caught them. A formal check covers logic that shows without
  a browser.
- The sweep's page tiers are R1 to R5. P0 to P3 is only a bug's priority, as
  the chips board ranks it, and domain fix runs go in that order.
- The sweep names two roles. The tester runs rounds, triage and filing. The
  fixer runs the domain fix runs, babysits them and keeps the formal checks.
  natamox is the tester and zbeyens the fixer (owner's word, 2026-10-23).
- Filing a domain offers one suggested task for its fix run. The tester's
  session leaves it uncarded, as `AGENTS.md`'s Sweep handoff line says, and
  pushes the ledger at once, and the fixer's `/chips all` takes it over. It
  first ran between two machines on 2026-10-24, when zbeyens's `/chips all`
  took over 14 tasks natamox's tester session had offered.
  `docs/plans/2026-10-23-sweep-handoff.md` and its ten smoke rounds hold the
  proof of the routes. The
  fix run builds a missing M6 check before its fix, and the task waits on a
  check task that is already open. The task runs at `high` once triage has
  traced every kind to its owner.
- Triage takes a session logged blocked, which runs again next round. The
  tester closes each issue once its recheck passes on beta, and the next round
  waits only for the fixes the domain runs landed.
- Beta issues upload their recordings through `gh --attach`, and new members
  of a filed kind reach its issue as a comment.
- `pnpm check` has an `autoformat-rules` step.
  `apps/www/scripts/autoformat-input-rules.ts` reads every rule the www
  autoformat and basic marks kits declare and types it key by key into a real
  editor, then types every sequence of up to three keys over the rules' 15
  characters. A shorthand must apply whole, no sequence may change another
  paragraph, and one undo must take back each rule. The editor's own count of
  text input rules must match the rules the script reads. It runs for a change
  to the registry editor kits, platejs or plitejs source, the script or the
  baseline helper.
- Its 172 current failures sit in
  `apps/www/scripts/autoformat-input-rules-baseline.json`, which only shrinks.
  The `autoformat-input-rules` skill says how to read a failure, tell a real
  bug from a modeling error and move its coverage record forward.
- When a browser test fails or times out unexpectedly, the package's `test`
  reads every editor in the test's browser before its contexts close and
  saves `editor-state.json` beside Playwright's screenshot. Each field says
  whether it was read, cut to fit, or why it was not read, and the file keeps
  the test's own errors apart from any capture error.
- The `browser-test-imports` step of `pnpm check` keeps every www and Plite
  browser spec, donor specs included, on the package's `test`. It refuses a
  call that opens a context or browser apart from the test's, unless a marker
  above it gives the reason.
- verify's Drive section and the Bug fix playbook tell an agent to read a
  failed spec's saved files, unread fields first, before it patches or drives
  again. www keeps trace recording off, because keeping traces made four of
  its specs about 30% slower.

## What other editors do

The 2026-10-02 research run read 12 autocomplete designs and five testing or
device tools at recorded revisions; none of the editors was run.

| Tool | Typing reaches the editor as | Reads the editor model | Mobile web |
| --- | --- | --- | --- |
| `@platejs/test` with Playwright | trusted keys and CDP IME | yes, through the handle every `Editable` attaches | Playwright device emulation only |
| tester-army `e2e` 0.15.2 | targeted typing uses `locator.fill`; untargeted typing uses Playwright keys | JSON reads through `browser.evaluate`; no built-in editor oracle | its mobile engine refuses URL targets |
| agent-device 0.21.18 | its own test keyboard or `adb` key events | no | opens URLs in Safari |
| argent | text uses `adb input text`; touch actions are available | page JavaScript through CDP; Android attachment was not run | opens URLs |
| stim, MiniSim | React Native only, or `adb input text` | no | no |

Slate's issue history ranks the Android cases (shard 005): Korean first
syllables, suggestion-strip taps, autocorrect on space, mark toggles that drop
the keyboard (Slate #6022), trigger popups and pending words lost to toolbar
taps.

## Layer and owner

| Current capability | Layer | Package | Why |
| --- | --- | --- | --- |
| Browser model oracle | proof tooling | `@platejs/test/playwright` | One harness serves desktop and emulated mobile. |
| Browser page handle | Plite | `plitejs/react` `Editable`, on every mount | The oracle reads it on every page, production builds included. |
| Editor state at a failed test | proof tooling | `@platejs/test/playwright` | Its `test` reads every editor handle in the test's browser when a test fails, so no spec has to. |

## Native behavior and proof

| Behavior | Current evidence | Limit |
| --- | --- | --- |
| Desktop paste per engine | Paste specs on all five Plite projects | Four silent fallbacks to the handle or a synthetic event let a broken native paste pass |
| Android soft-keyboard input | Pixel 5 device emulation | Emulation sends no soft-keyboard events; Android gates have no producer |
| Typing after a handle-set selection | A contract test pins the `'browser-handle'` selection reason | No probe compared it with typing after a click |
| Pinyin preedit caret paint (#5137) | CDP composition only | CDP does not drive the OS input method |
| iOS Safari typing | unproven | No lane |
| Screen-reader output | unproven | Requires its own observed proof |

## Open work

- natamox files each round 1 domain from the triage in
  `docs/plans/2026-10-23-sweep-loop.md`, and offers its fix-run task as
  `sweep.md`'s Triage a domain says. owner: natamox. stop: every round 1
  domain filed.
- t_c4407e94 holds the autoformat rule-order bugs, with the four kinds the
  autoformat check found, and each fix lowers that check's baseline.
  The composition run t_1d843b2a, which took in t_94ffdd65, and t_8276a635
  start once their domain is filed.
  t_01a87aed, the arrow regression, stays its own P0 task. owner: zbeyens.
  stop: each lands or is dropped.
- The fixer's order trusts the board's priorities, and the board holds 22
  Ready P0 and 48 Ready P1 tasks, most without a card. owner: zbeyens. stop: a
  `/chips all` sweep judges each Ready P0's priority again.
- No R5 session has run. owner: natamox and zbeyens. stop: round 2's tally
  shows an R5 session, or zbeyens cuts R5.
- The sweep's four hardening items have no chips, because a run offers chips
  only for new P0 and P1 finds (owner's word, 2026-10-23). Each belongs to the
  loop step that names it, as `docs/plans/2026-10-23-sweep-loop.md`'s Open work
  says. owner: zbeyens. stop: round 2 starts.
- The formal-check intake's tasks run in its order: t_a998edbb, t_dd929413,
  t_df2f315f, which also runs the autoformat check at four keys, then
  t_589db800 once two checks exist. owner: zbeyens. stop: each lands or is
  dropped.
- The autoformat and authored-order checks each wire their own workers and
  baseline, and the autoformat reader walks parser nodes by hand. A shared
  harness and typed node guards wait for the next check that needs them.
  owner: zbeyens. stop: the next formal check lands.
- The sweep's six moves have no trial. owner: zbeyens. stop: round 2's tally,
  or 2027-01-15.
- With an empty `PLATE_BASELINE_BASE`, as on `workflow_dispatch`, every baseline step falls back to `HEAD`. owner: Ziad. stop: CI passes a non-empty base to every baseline step. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- The 2026-10-06 knowledge plan's compile readers found 11 problems in Plite and Plate tests, such as an autoformat suite that cannot fail and an empty test body in the query contract. Each is an open `finding` row in that plan's decision log, and phase 4's side findings in the same area join them; a claim marked inferred or "not run" needs its probe before a fix. owner: Ziad. stop: each is fixed through `test-audit` or dropped, or 2026-12-07. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- The 2026-10-06 knowledge plan's compile readers found 10 problems in proof and release tooling, such as WebKit claims that no CI job runs and an Appium iOS transport marked release-capable that no driver proves. Each is an open `finding` row in that plan's decision log, and phase 4's side findings in the same area join them; a claim marked inferred or "not run" needs its probe before a fix. owner: Ziad. stop: each is fixed or its claim narrowed, or 2026-12-07. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- The S5 bench, the kit probe's extra browsers and the authored performance probe's arms close their own contexts inside the test, so they get no editor state. owner: zbeyens. stop: Playwright offers a public hook that runs before each context closes. Carried from the [browser failure evidence plan](../2026-10-27-browser-failure-evidence.md), like the next eight items.
- The native IME lane drives a Chrome it connects to over CDP, so it gets no editor state. owner: zbeyens. stop: a public way to hand that browser to the capture.
- The kit probe unmounts its editors as part of what it measures, so even a hook before its context closes would find none. owner: zbeyens. stop: a page-side call that saves state before the probe's own cleanup.
- On an S5 bench run the capture adds the worker's idle browser and one context per cell, and the authored mounted performance contract and the kit lifetime probe now run beside one idle context, which nobody has measured. owner: zbeyens. stop: the next S5 bench run, which compares one cell with and without the capture, and the next run of each probe.
- A failure in the setup of a `context` override gets no file, because the capture's fixture depends on that context. No spec in either folder overrides `context` today. owner: zbeyens. stop: the first spec that overrides `context`.
- A failure that starts after the capture, in an `afterAll` hook or a fixture torn down after it, gets no file. owner: zbeyens. stop: a Playwright hook that runs after every teardown while the browser is still open.
- Nothing committed fails when Playwright's fixture order or a handle getter's name changes. owner: zbeyens. stop: `platejs/testing` exports the handle's type, so the capture can type the getter names it reads.
- No real failure has yet been worked out from `editor-state.json` alone. Each reverted fix tried had a cause a fresh agent named from the code alone, so the comparison between agents with and without the file never ran. owner: zbeyens. stop: a reverted fix whose code shows no suspect, or the owner drops the demo.
- `autoformat:text-substitution-native-input` fails on www Chromium before and after this change. Typing ` ->` leaves ` -`, and the saved state shows no commit for `>`. owner: zbeyens. stop: the next run of the autoformat kit work.
