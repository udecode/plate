# Editor proof

Page: https://claude.ai/artifact/XqsY1CcceaevUNqabTFPbw

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
  pushes the ledger at once, and the fixer's `/chips all` takes it over. The
  fix run builds a missing M6 check before its fix, and the task waits on a
  check task that is already open. The task runs at `high` once triage has
  traced every kind to its owner.
- Triage takes a session logged blocked, which runs again next round. The
  tester closes each issue once its recheck passes on beta, and the next round
  waits only for the fixes the domain runs landed.
- Beta issues upload their recordings through `gh --attach`, and new members
  of a filed kind reach its issue as a comment.

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
- t_c4407e94 holds the autoformat rule-order bugs and waits on the rule check
  t_30422a81. t_94ffdd65 and t_8276a635 start once their domain is filed.
  t_01a87aed, the arrow regression, stays its own P0 task. owner: zbeyens.
  stop: each lands or is dropped.
- Nobody has run the handoff between two people. natamox's first filed domain
  shows whether its task reaches zbeyens's board. owner: natamox and zbeyens.
  stop: the first domain task reaches zbeyens's board, carded or listed as
  `start <id>`.
- The fixer's order trusts the board's priorities, and the board holds 22
  Ready P0 and 48 Ready P1 tasks, most without a card. owner: zbeyens. stop: a
  `/chips all` sweep judges each Ready P0's priority again.
- No R5 session has run. owner: natamox and zbeyens. stop: round 2's tally
  shows an R5 session, or zbeyens cuts R5.
- The sweep's four hardening items have no chips, because a run offers chips
  only for new P0 and P1 finds (owner's word, 2026-10-23). Each belongs to the
  loop step that names it, as `docs/plans/2026-10-23-sweep-loop.md`'s Open work
  says. owner: zbeyens. stop: round 2 starts.
- The formal-check intake's tasks run in its order: t_30422a81, t_a998edbb,
  t_dd929413, t_df2f315f, then t_589db800 once two checks exist. owner:
  zbeyens. stop: each lands or is dropped.
- The sweep's six moves have no trial. owner: zbeyens. stop: round 2's tally,
  or 2027-01-15.
