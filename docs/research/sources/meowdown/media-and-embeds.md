# Meowdown: media and embeds

## Image tap on touch

- **Image tap.** `prosekit/meowdown@5b9962982a1cb3d1732355c753ce76d9a5966af3:packages/core/src/extensions/image.test.ts` (lines 155-262) pins that on a clickable image preview a touch `pointerdown` is cancelled without swallowing the click, and a stationary touch tap fires the image-click handler from `touchend` and cancels that `touchend`. A source comment there says iOS WebKit otherwise focuses the surrounding contenteditable and raises the software keyboard. The tap cases build synthetic `Touch` events and skip desktop WebKit, so they run only in Chromium and Firefox and prove nothing about iOS. Plite's raw-device scenario list (`RAW_MOBILE_SCENARIOS`, `packages/test/src/proof/raw-mobile-proof.ts:7-24`) has no image-preview tap or software-keyboard case, so a Plate claim here waits for a raw iOS receipt. Evidence: `docs/editor-test-harvester/meowdown/report.md:149, 251-252`; checked on 2026-10-08.
