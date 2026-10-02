# Shard 010: Android lane probes before the device module

The plan's Phase 2 probe step settled four questions on 2026-10-02 before the
device module was written. Every probe ran on the local AVD
`Pixel_9_API_36_Play` (Android 16, Chrome 146.0.7680.177, Gboard
17.0.14.880768217, 1080x2424 at density 420) against the neutral page in
`sources/android-probes/www/index.html`, served through `adb reverse` and read
over `adb forward localabstract:chrome_devtools_remote`. Every input was a real
`adb shell input tap` on a Gboard key or on page content. The scripts and raw
results sit in `sources/android-probes/`.

## Does a `uiautomator dump --windows` change what the page receives?

No observable effect. Three conditions, three runs each, typed `hello` into the
textarea from a cached key map: no dump since a Chrome restart, a dump right
before typing, and a restart after a dump. All nine runs produced the same
20-event signature (`keydown` Unidentified, `beforeinput` and `input`
`insertText`, `keyup` per letter), the same value, overlapping timings for a
300-node DOM workload (7.5 to 10.5 ms medians) and no bound accessibility
service in `dumpsys accessibility` afterwards (`uia-result.json`). The lane may
calibrate with a dump; it still caches the map so a measured run never dumps.

## How do CSS coordinates map to screen taps?

`screenX = cssX * devicePixelRatio` and `screenY = contentTop + cssY *
devicePixelRatio`, with `devicePixelRatio` 2.625. One calibration tap on blank
content, read back through the page's `pointerdown` client coordinates, gave
`contentTop` 289 and an x offset of 0. Taps aimed at the right edge of known
characters then placed the caret exactly, with 0 px pointer error
(`tap-result.json`). The toolbar can hide on scroll, so the lane recalibrates
from a `pointerdown` instead of trusting a fixed top.

Some content taps never reach the page. In one fixed five-tap sequence the
third and fifth taps produced no `pointerdown` at all and left the caret where
it was, on every one of three runs; a different sequence of three taps landed
every time. Chrome had drawn an insertion handle at the caret before those
taps. The lane therefore checks each content tap's `pointerdown` against its
target and fails the step when none arrives.

## What does the suggestion strip expose and send?

The strip is in the dump. After `hel`, candidate nodes such as `hel` and
`hello` carry bounds in `[115,1541][965,1657]` (`strip-result.json`). Tapping a
candidate that extends the typed prefix sends one `keydown` Unidentified and an
`insertText` of the remaining suffix plus a space (`"lo "`), with no
replacement event. Tapping `hello` after the misspelled `helo` sends two
`keydown` Unidentified events, a `deleteContentBackward`, then `insertText`
`"lo "`. Case 2 keeps the strip and must start from a misspelled prefix to
produce a replacement.

## What does Gboard send for the census inputs?

From `census-result.json`, `korean-result.json` and the autocorrect probe:

| Input | Textarea | `contenteditable` |
| --- | --- | --- |
| Letter | `keydown` Unidentified, `insertText` | same |
| Space after a known word | `keydown` Unidentified, `insertText` `" "` | same |
| Space after `becuase` (autocorrect on) | two `keydown` Unidentified, `deleteContentBackward`, `insertText` `"because "` | same |
| Enter | `keydown` Enter, `insertLineBreak` | `keydown` Enter, `insertParagraph` |
| Backspace | `keydown` Backspace, `deleteContentBackward` | same |
| Korean jamo (Gboard 두벌식) | `keydown` Unidentified, `compositionupdate`, `insertCompositionText` with the whole composed word; `ㄱ` and `ㅡ` taps send that pair twice | same |
| Space after Korean | `compositionupdate`, `compositionend`, then a second `keydown` and `insertText` `" "` | same |

English Gboard never composed. Korean composed the whole word (`한글`), not one
syllable at a time. Autocorrect did not change `Teh` at sentence start but did
change `becuase` and `recieve`.

## What this changes in the plan

- The witness rule "at most one `keydown` per tap" rejects real input: strip
  replacements, autocorrect on space, some Korean jamo and the Korean commit
  all send two. The rule that holds on every trace above pairs events instead:
  every `beforeinput` and composition update follows its own trusted `keydown`
  with key Unidentified, Enter or Backspace inside a lane gesture window. A
  bypass that inserts without a `keydown` (`Input.insertText`) or with a real
  key name still fails it. `adb shell input` arrived as an Unidentified
  keydown in one recording, which passes and is the witness limit, and with
  its real key name in another. Neither recording shows a composition, so what
  decides it is unknown.
- Setup dismisses Gboard's "Korean is now installed" banner and switches
  language with the navigation bar's input method key, which Gboard handles as
  its language key. Korean keys are labeled by name (`히읗`, `니은`, `기역`) and
  vowels by syllable (`아`, `으`); the key map is keyed by those labels.
- Gboard settings expose auto-correction, auto-capitalization, the suggestion
  strip and word suggestions as checkable rows, so setup can read them back.
- Android also lists the Appium, Unicode and Empty input methods on this
  image; setup records the selected one and refuses anything but Gboard.

## Limits

One emulator build, one Gboard version and three runs at most per question. A
physical phone, another Gboard release or a Samsung keyboard can send other
events, which is why the lane records the keyboard's version and calibrates per
keyboard.
