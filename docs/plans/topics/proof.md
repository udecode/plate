# Editor proof

Page: https://claude.ai/artifact/1C5Axx5Aqg68Ly6zr2JkQo

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
