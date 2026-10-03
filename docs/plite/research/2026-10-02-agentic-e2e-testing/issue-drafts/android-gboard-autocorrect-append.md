# [Beta]: Gboard autocorrect on Android appends the corrected word after the next word

Local draft from the device lane; not filed. Owner: zbeyens.

## Testing lane

- Repository: `udecode/plate`
- Branch: `next`
- Release channel: Beta
- Exact commit/package version: `next` at `cf15725603` with uncommitted
  local changes from several sessions; the served Plite export is identified
  by its `.editor-proof-build.json` fingerprint in each run log.

## Summary

In an empty Plite editor on Android Chrome, Gboard's autocorrect on space
leaves the misspelled word in place and appends the corrected word after the
word typed next, so `becuase go` becomes `BecuasegoBecause `.

## Reproduction

1. On Android Chrome with Gboard (English, auto-correction on), open
   `/examples/plite/custom-placeholder`.
2. Tap into the empty paragraph.
3. Type `becuase`, press space, then type `go`.

## Expected

`Because go`, with the caret after `go`. In a plain `<textarea>` and a bare
`contenteditable` on the same device, the same space replaces the word.
Authority: the census in `shards/010-android-lane-probes.md` and Slate #5891.

## Actual

- The space tap makes Gboard reopen the word as a composition
  (`compositionupdate` `Becuase`), then send `insertCompositionText`
  `"Because "`; the following `compositionend` is not trusted.
- The model ends as `BecuasegoBecause `: the correction never replaces
  `Becuase` and lands after `go`.

## Environment

- Emulator `Pixel_9_API_36_Play`, Android 16, Chrome 146.0.7680.177, Gboard
  17.0.14.880768217.

## Evidence

- `sources/android-probes/plite-autocorrect-trace.json`: the device lane's
  event trace and gesture steps for one run, whose model ends as
  `BecuasegoBecause `.
- `apps/plite/tests/device/autocorrect-empty.device.ts`: the device case; its
  `device.knownFailure` reads `BecuasegoBecause ` in five of five warm runs,
  and the run attaches each trace as `device-witness.json`.

## Caveat

Inferred, not proven: the replacement composition seems to target a range
Plite no longer maps, which may share a cause with the Korean composition
draft. One emulator build; physical phones are unchecked.
