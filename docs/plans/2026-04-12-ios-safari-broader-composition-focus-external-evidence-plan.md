---
date: 2026-04-12
topic: slate-v2-ios-safari-broader-composition-focus-external-evidence-plan
---

# iOS Safari Broader Composition / Focus External Evidence Plan

## Purpose

Close the remaining iOS Safari parity slice that the local automation stack
still cannot prove honestly.

## Current Local Ceiling

What the current local stack can prove:

- desktop WebKit focus and zero-width rows
- desktop WebKit direct-input ceiling
- browser-level proxy composition lane
- route/setup truth on local Safari surfaces through direct Appium
- direct iOS Simulator Safari green lanes on some targeted surfaces

What it still does not prove cleanly:

- broader Safari contenteditable typing on placeholder-like rows
- broader composition/focus behavior across the relied-on iOS/Safari weird-input
  cases

Known local blockers:

- Appium/XCUITest `value` is not trustworthy contenteditable typing proof on the
  placeholder lanes
- the `agent-browser` iOS provider is still unreliable on these local routes

Reference:

- [2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md)

## Goal

Gather real iOS Safari evidence for the remaining composition/focus claim
without lying about what the simulator stack already proved.

## Evidence Order

1. real iPhone Safari manual-device artifacts
2. real-device browser farm with video and Safari build metadata
3. alternate iOS automation substrate only if it can prove real contenteditable
   typing and keyboard presence

## Required Lanes

### Lane 1: Placeholder / Empty-Start Typing

Flow:

1. open `/examples/placeholder?debug=1`
2. focus the editor in Safari
3. type through the real iOS keyboard
4. capture final text, selection, and event trace

Pass rule:

- typed text commits into the editor
- selection lands after the inserted text
- no dead input path or null-event-only trace remains

### Lane 2: No-FEFF Placeholder Typing

Flow:

1. open `/examples/placeholder-no-feff?debug=1`
2. focus the editor
3. type through the real iOS keyboard
4. capture final text, selection, and event trace

Pass rule:

- typed text commits into the no-FEFF path
- selection remains sane after commit

### Lane 3: Broader Focus / Selection Recovery

Flow:

1. open the relevant focus-sensitive route
2. blur and refocus Safari in a way that matches the legacy concern
3. capture the final selection and DOM state

Pass rule:

- selection recovers to a sane position
- no stale hidden selection range survives

## Artifact Root

Use:

- [ios-safari-composition-focus](/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/ios-safari-composition-focus/README.md)

One-command capture:

```sh
bash /Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/capture-bundle-assets.sh \
  ios-sim \
  ios-safari-composition-focus \
  placeholder
```

## Required Bundle Per Run

- `notes.md`
- `selection.txt`
- `dom.txt`
- `actions.md`
- `screenshot-01.png`
- `screenshot-02.png`
- `video.mp4`

## Device Metadata

Always record:

- device model
- iOS version
- Safari version
- keyboard type and locale
- whether predictive text was enabled

## Exit

This lane closes only when the remaining iOS Safari rows are backed by real
device artifacts and the ledgers are updated from those artifacts.
