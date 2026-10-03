# [Beta]: Gboard Korean on Android commits each jamo separately instead of composing syllables

Local draft from the device lane; not filed. Owner: zbeyens.

## Testing lane

- Repository: `udecode/plate`
- Branch: `next`
- Release channel: Beta
- Exact commit/package version: `next` at `cf15725603` with uncommitted
  local changes from several sessions; the served Plite export is identified
  by its `.editor-proof-build.json` fingerprint in each run log.

## Summary

Typing Korean with Gboard's 두벌식 layout in a Plite editor on Android Chrome
commits every jamo on its own, so `안녕` becomes `ㅇㅏㄴㄴㅕㅇ`; Enter then
splits before the last composing jamo.

## Reproduction

1. On Android Chrome with Gboard, add the Korean 두벌식 keyboard.
2. Open `/examples/plite/custom-placeholder` (empty paragraph with a
   placeholder) or `/examples/plite/plaintext` (end of the text).
3. Tap into the editor, switch Gboard to Korean, and type ㅇ ㅏ ㄴ ㄴ ㅕ ㅇ.
4. Press Enter.

## Expected

The editor shows `안녕`, as a plain `<textarea>` and a bare
`contenteditable` do on the same device, where Gboard composes the whole word
(`한글`) across jamo. Enter ends the composition and splits after `안녕`,
leaving an empty second paragraph. Authority: the neutral-page census in
`shards/010-android-lane-probes.md` and Slate #5493 and #5883.

## Actual

- The model and DOM read `ㅇㅏㄴㄴㅕㅇ` (or ` ㅎㅏㄴㄱㅡㄹ` for 한글 in
  plaintext).
- Every jamo key starts a new `compositionstart` whose update holds only that
  jamo; Gboard never extends the composing word. Some keys end with a
  `compositionend` that is not trusted, which Chrome raises when a script
  changes the selection during composition.
- After Enter, the blocks are `["ㅇㅏㄴㄴㅕ", "ㅇ"]`: the still-composing jamo
  moves to the new paragraph.

## Environment

- Emulator `Pixel_9_API_36_Play`, Android 16, Chrome 146.0.7680.177, Gboard
  17.0.14.880768217.

## Evidence

- `sources/android-probes/plite-korean-plaintext-trace.json`: the device
  witness trace for plaintext, with every step's events.
- `sources/android-probes/korean-result.json`: the same jamo composing `한글`
  in a textarea and a bare contenteditable.
- `apps/plite/tests/device/korean-placeholder.device.ts`: the device case;
  both `device.knownFailure` checks read `ㅇㅏㄴㄴㅕㅇ` and then
  `["ㅇㅏㄴㄴㅕ", "ㅇ"]` in five of five warm runs.

## Caveat

Inferred, not proven: the untrusted `compositionend` and the restarted
composition point at Plite writing the DOM selection or replacing the text
node while Gboard composes. One emulator build; a physical phone and other
Gboard versions are unchecked.
