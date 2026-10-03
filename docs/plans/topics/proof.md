# Editor proof

Page: https://claude.ai/artifact/1C5Axx5Aqg68Ly6zr2JkQo

How Plate proves editor behavior that unit and DOM tests miss, through real
input and a model oracle that reads the page. Every plan for the `proof` scope
is one iteration of this subject; the scope's review history is in the ledger
hub.

## Public API

An app under test installs the browser handle at module scope in a test or
development entry; nothing attaches it by default.

```ts
// apps/plite/src/app/providers.tsx
import { installBrowserHandle } from 'plitejs/react';

installBrowserHandle();
```

Each Playwright project names how `editor.clipboard.pasteText` and `pasteHtml`
deliver a paste, typed by `BrowserTestOptions`.

```ts
// apps/www/playwright.config.ts
{
  name: 'webkit',
  use: { ...devices['Desktop Safari'], clipboardTransport: 'event' },
}
```

Native event traces can record `keydown` and `pointerdown`, and every entry
carries `isTrusted`, `key`, `keyCode`, `clientX`, `clientY` and a monotonic
`seq`.

```ts
// packages/test/src/device/lane.ts
const TRACED_EVENTS = [
  'keydown',
  'pointerdown',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionupdate',
  'compositionend',
] as const;

await startBrowserNativeEventTrace(target, {
  events: TRACED_EVENTS,
  maxEntries: 10_000,
});
```

## Main changes

- `Editable` attaches the browser handle only through a function that
  `installBrowserHandle()` registers, and the kernel trace keeps entries only
  after it runs. A production `plitejs/react` import drops the handle (0
  references, 10,255 bytes); a `platejs/react` import still carries it because
  Plate's unbundled barrel defeats tree-shaking.
- Harness pastes go through one per-project transport and fail unless a newer
  commit carries the `paste` tag and changes the document, or when the page
  threw. The event transport
  sends `paste`, then `beforeinput` when nothing cancels it, instead of
  calling `insertData`.
- A private Android lane in `packages/test/src/device` types with real Gboard
  touches over `adb`, attaches through a DevTools relay that refuses every
  `Input.*` command and both channels that could carry one, and gates every
  case on a witness: each `beforeinput` follows its own `keydown`, each
  `input` its own `beforeinput`, and each tap produces its key's class.
  `apps/plite/playwright.device.config.ts` runs its cases five times on each
  attached device.
- `tooling/ime` is built to drive the real macOS Pinyin input method into
  exact Google Chrome for #5137. Pinyin selection has not succeeded on this
  machine, so neither the helper's typing nor the gated spec has run.

## What other editors do

The 2026-10-02 research run read 12 autocomplete designs and five testing or
device tools at recorded revisions; none of the editors was run.

| Tool | Typing reaches the editor as | Reads the editor model | Mobile web |
| --- | --- | --- | --- |
| `@platejs/test` with Playwright | trusted keys, CDP IME, and real Gboard touches over `adb` in the device lane | yes, through the installed handle | Chrome for Android over a guarded DevTools endpoint |
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
| Browser model oracle, paste transports and native traces | proof tooling | `@platejs/test/playwright` | One harness serves desktop, emulated mobile and the device lane. |
| Browser handle installer and trace retention | Plite | `plitejs/react`, re-exported by `platejs/react` | Proof instrumentation is opt-in; a production `plitejs/react` entry carries none of it, and a `platejs/react` one still does (open). |
| Android device lane | proof tooling | private `packages/test/src/device`, reached through `@platejs/test/device` | Local only; no package export and no CI job. |
| macOS IME helper | tooling | `tooling/ime` | Drives OS input for one gated spec. |

## Hard cuts and app migration

- The browser handle no longer attaches on every mount. An app read by
  `@platejs/test` calls `installBrowserHandle()` before its first editor
  mounts, as in the Public API pair; otherwise `ready` fails with "browser
  handle not installed".
- Paste fallbacks are gone. A Playwright project that pastes sets
  `use.clipboardTransport`; a paste that never applied fails instead of
  retrying through the handle. Tests that sliced the kernel trace from a
  pre-paste length read the whole trace, which each paste clears first.

## Native behavior and proof

| Behavior | Current evidence | Limit |
| --- | --- | --- |
| Desktop paste per engine | Ten paste spec files: Chromium 382 and Firefox 341 native, WebKit 353 and Pixel 5 156 event, mobile WebKit 350 with 9 failures outside paste | Two Plite tests stay excluded; the Apple converted spaces one fails the same way under the old handle transport |
| Gboard strip replacement, Bold toggle, toolbar tap during composition, mention tap and Backspace | Device lane from a cold boot, five warm runs each on `Pixel_9_API_36_Play`, all passing; setup and restore leave the device as found | One emulator and Gboard 17.0.14; no physical phone; Android replaces the cold-boot implicit input subtype with the enabled English one |
| Gboard Korean composition | Device lane, five of five runs: Plite commits each jamo separately and Enter splits before the composing jamo | Product bug, local draft only |
| Gboard autocorrect on space | Device lane, five of five runs: `becuase go` ends as `BecuasegoBecause ` | Product bug, local draft only |
| Typing after a handle-set selection | Probe on five projects: same input ownership as a click | none |
| Pinyin preedit caret paint (#5137) | Helper, exact-Chrome launch and gated spec built | Blocked until Pinyin - Simplified is fully installed |
| iOS Safari typing | Probe written | Quarantined: Xcode 26.6 needs the iOS 26.5 platform |
| Screen-reader output | unproven | Requires its own observed proof |

Device-lane evidence stays local and does not satisfy the raw-mobile release
gate. A release would trust it only by re-deriving its witness verdicts,
digests and build binding (review `2026-10-02-proof-release-trust`).
