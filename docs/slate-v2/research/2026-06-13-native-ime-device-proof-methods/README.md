# Native IME Device Proof Methods

Date: 2026-06-13

## Question

What is the honest proof method for Slate v2 native IME/device behavior?

## Scope

- Search current web/GitHub/OSS evidence for IME automation limits and device
  proof options.
- Separate desktop Playwright/CDP composition rows from raw OS IME proof.
- Promote only a proof-lane design, not runtime code.
- Do not claim raw mobile, OS candidate-window, or native IME behavior without a
  real device/emulator lane.

## Verdict

Slate v2 should keep desktop Playwright and Chromium CDP IME rows as scoped
browser proof, but they are not raw native IME proof.

The strongest future lane is a deterministic Android test IME on a real
device/emulator:

1. Serve a Slate route with native-event trace capture enabled.
2. Install/select a small Android `InputMethodService` that can send scripted
   `InputConnection` sequences for composing text, committed text,
   surrounding-text deletion, and IME actions.
3. Drive focus, route gestures, and IME controls through Appium/ADB.
4. Capture model value/selection, native `window.getSelection()`, native event
   trace, screenshots, and device metadata.
5. Label each run by device, OS, browser, keyboard/IME implementation, locale,
   and input subtype.

Until that lane exists, raw IME/device rows stay deferred. That is not
pessimism; WebDriver itself still lacks general IME simulation, and Appium
Unicode/text insertion can bypass the native keyboard behavior we need to test.

## Evidence Summary

- W3C WebDriver issue `#1683` states WebDriver cannot currently simulate IME
  input well enough for scripts that require composition.
- WPT issue `#13464` records that Input Events tests need user interaction and
  cannot be fully created with JavaScript-only events; contenteditable
  selection through WebDriver is also a known weak point.
- Chrome DevTools Protocol `Input.imeSetComposition` is useful for Chromium
  route rows, but it is Chromium-specific and not proof of OS IME candidate UI
  or device keyboard behavior.
- Appium Unicode Keyboard helps send non-ASCII text, but Appium's own docs
  state iOS sends non-ASCII directly and Android uses a specialized keyboard.
  That is scoped text injection, not proof of user keyboard composition.
- Appium `mobile: performEditorAction` can test Android editor actions such as
  Done/Search on the focused element, but it does not create composition text.
- Android's IME framework exposes the right primitive layer:
  `InputMethodService`, `InputConnection`, `setComposingText`, `commitText`,
  `deleteSurroundingText`, and selection update callbacks.
- `easylogic/contenteditable` is useful as an environment matrix because it
  records browser/OS/IME combinations and unknowns; it is not a substitute for
  local Slate proof.

## Promotion

- Add a claim-width rule to
  `docs/slate-v2/selection-navigation-coverage.md`: raw IME/device proof needs
  a real device/emulator lane or deterministic test IME, and Appium
  Unicode/direct text insertion is not enough.
- Defer the deterministic Android test IME lane to `slate-plan`/`slate-browser`
  until the user wants to invest in raw device proof.

## Claim Width

This packet claims research closure and proof-method design only. It does not
build the Android IME, run Appium, modify runtime code, or claim mobile/OS IME
coverage.
