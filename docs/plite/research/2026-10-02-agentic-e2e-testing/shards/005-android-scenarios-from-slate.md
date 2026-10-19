# Android device lane first cases, ranked by user pain

Read-only research shard for review `2026-10-02-proof-agentic-e2e-review`, scope `proof`, checked 2026-10-02.

Sources are the Slate issue tracker (live, 2026-10-02), the Plate issue tracker (live), the local Slate checkout at `945a484df249` (2026-04-13, so it predates Slate PR 6096), and the Plate checkout at `cf1572560313`. Every read is in `reads.tsv`. Downloaded threads are in `issues/` and the raw search results in `raw/`.

Grades: A means I read the source. B means I read the issue or PR thread. C means a plan or doc. D means a search hit or title only. A guess is labeled guess.

## Bottom line

The Android pain in Slate's tracker since the 2022 rewrite (PR 4988) clusters on input that replaces or composes text, not on plain typing. The heaviest open threads are first-character composition in an empty block (5493, 12 comments and 4 reactions, open), suggestion and predictive replacement (5130 and 5643, open), and keyboard dismissal around marks and inline elements (6022, 5680, open). Plate's own Android reports add trigger characters that never reach plugins (plate#1230, 15 comments) and plugin-specific Enter breakage (plate#3735, plate#3882). Slate has no real-IME automation at all. Its Playwright config has only a `Pixel 5` profile on desktop engines (A, `playwright.config.ts:29`), and its Android regression check is the manual `android-tests` page (A). Plate lists every one of these Slate rows as Related with no exact closure claimed (C, `docs/plite/ledgers/issue-coverage-matrix.md`).

The probe's result does not mean English Gboard never composes. Slate maintainers and reporters describe English composition on Android from 2022 through 2026 (5078, 5019, 5493, PR 6096). The probe saw none on one emulator configuration. The lane therefore needs CJK and Korean cases to guarantee composition, and a short event census before it trusts any English case.

## 1. Ranked scenarios

Pain counts are comments (c) and reactions on the issue body (r) at read time. Plate status is the row's state in Plate's issue ledgers plus any Plate-owned gate.

| Rank | ID | Keyboard | Language or IME | Action | Symptom class | Pain evidence | Slate status | Plate status | Stock emulator | Grade |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | S1 | Gboard (also Sogou handwriting, voice IMEs) | Korean, Japanese romaji, Chinese Pinyin | First syllable or character into an empty block or under a visible placeholder, then a second one | Duplicate or orphaned first character (`ㅇ안녕`, `hあ`, doubled first letter) | 5493 (12c 4r), 4693 (1c 4r), 5883, 5989, 5979, 5023 (6c 5r, WebKit UA), plate#3250; PR 6096 says every message in a chat app starts with a stray jamo | 5883 fixed by PR 6096 (merged 2026-08-18). 5493 and 5989 open | Related, not claimed. Plite defers pending diffs while composing (contract test, A), but nothing checks the empty-leaf node swap on a device | Yes, add Gboard Korean, Japanese and Pinyin | B |
| 2 | S2 | Gboard, SwiftKey, AOSP, Samsung | English | Tap a suggestion-strip candidate that replaces a partial word, also inside or after marked text | Duplicate prefix (`helhelp me`, `rrerepreply`), caret after the first letter, inserted space | 5643 (4c 3r, comments add AOSP, Chrome, Firefox, Cinny), 5130 (14c 3r), 4602 (8c 2r), 5371, 4550, plate#4874 | All open except 4550 | Related, not claimed | Gboard yes. SwiftKey likely from Play Store on a Play image (guess). Samsung no | B |
| 3 | S3 | Gboard | English | Misspell in the first line of an empty editor, press space to autocorrect (`Cant` to `Can't`), keep typing | Correction does nothing, or caret jumps to the word start | 5892, 5891, 4531; Slate `android-tests#autocorrect` | 5892 fixed by PR 5901. 5891 and 4531 open | Legacy row tooling-blocked because Appium saw zero Gboard candidate nodes (C) | Yes | B |
| 4 | S4 | Default Android keyboard (Gboard), SwiftKey | English | Toggle Bold with a collapsed caret, then type | Keyboard dismissed, selection oscillates between old and new leaf | 6022 (reporter used a Pixel 9a emulator), 4405, Slate's SwiftKey mark-placeholder compat branch (A, `android-input-manager.ts:648`) | Open. Fix PR 6027 open | Package contract fixed the raw old-leaf replay. Keyboard visibility and IME stability stay an open gate (C, `docs/plans/2026-05-23-plite-android-mark-toggle-no-appium-proof.md`) | Yes | B |
| 5 | S5 | Gboard | English | Backspace next to or over a mention or link inline; tap an inline void | Keyboard hides, text multiplies, caret jumps across the inline, keyboard does not open on tap | 5680, 5357, 5052, 5192, 5175 (4c), 5167, 5183 | 5357, 5192, 5052 fixed or closed. 5680, 5175, 5183 open | Related | Yes | B |
| 6 | S6 | Gboard, Samsung | English, plus a composing IME for the query | Type a trigger (`@`, `/`), type a query, tap a combobox option, with and without an active composition | Trigger missed, popup closes when composition starts, caret wrong after option tap | plate#1230 (15c), 5928, 5540 (filed against Plate's mention input), 5375 (desktop sibling) | 5540 fixed by PR 5541. 5928 open | The autocomplete plan keeps "Android taps during composition" open; emulated Android left the caret past committed text (C). The probe passed one non-composing tap (C) | Yes | B |
| 7 | S7 | Gboard | Any composing input | Leave a word pending or composing, then tap a toolbar button, a Send button or run `editor.insertText` | Lost last word, deleted line, text inserted before the last letter, double onChange | 5019 (1c 2r), 5078 (2c 2r), 4861, 5893, 5178 (1c 2r) | 5893 fixed by PR 5901. Others open | `settleInput()` exists (C). No device proof | Yes with Korean or Japanese | B |
| 8 | S8 | Gboard, Chinese IMEs | English, Pinyin | Hold backspace across blocks, backspace in an empty block, backspace after Pinyin composition, DEL at block end | Deletion stops at a block boundary, keyboard removed, two presses per delete, placeholder vanishes, caret shifts left | 4959 (2c 3r), 4714 (4c 4r), 4348 (5c 3r), 5984, 5730, 5099 (4c 1r), 5836, plate#1210 (10c 2r) | 4714, 5730 closed. 4959, 4348, 5984 (PR 5985 open), 5099, 5836 open | Related | Yes. A held key needs a long touch (guess, `input swipe` with equal start and end) | B |
| 9 | S9 | Gboard | English | Enter mid-word, at a mark boundary, at the end of a link, after a composing word | Delete instead of split, wrong split, crash | 5047, 5962, 4960, 4521, plate#3735, plate#3882 | Mostly fixed. 4521 open | Split-join, empty, remove and special rows proved through Appium keycodes (C) | Yes | B |
| 10 | S10 | Gboard | English | Tap to place the caret, long-press or double-tap to select then type over, caret in a block taller than the viewport | Caret jumps to the first line, selection lost, typed-over text misplaced | 3470 (13c 7r, pre-rewrite), 5291 (4c 1r), 4719, 5034 | Open | Most raw-mobile rows live here | Yes | B |
| 11 | S11 | Gboard | English | Markdown and autoformat shortcuts (`# `, `* `, `**x**`) | Shortcut never fires because plugin `insertText` overrides do not run | 4532, plate#1230; Plate plan `2026-05-18-plite-android-markdown-shortcut-flush-dx-ralplan.md` | 4532 open | Related | Yes | D for 4532, B for plate#1230 |
| 12 | S12 | Gboard clipboard, Chrome paste menu | Any | Paste multi-line text from the Android clipboard | Empty paste, extra trailing newline, lost fragment | 5190, 4432; Slate compat branch for the trailing newline (A, `android-input-manager.ts:611`) | Fixed (PR 5359) | Raw-mobile `native-clipboard` row | Yes | B |
| 13 | S13 | Gboard | English | Glide-type a phrase, then backspace once | Glided word dropped, backspace removes the wrong amount | 2952 (9c 2r, 2019), Slate `android-tests#insert`, Plate audit note on `deleteWordBackward` after a swiped word (C) | Closed in 2019. No newer report | Tooling-blocked (C) | Possible with `adb shell input motionevent` paths (guess) | B |
| 14 | S14 | Gboard voice, Sogou, Baidu | Voice | Dictate into an empty block | First phrase repeats | 5983 | Open | Related | Weak. Needs host audio and speech services | B |
| 15 | S15 | Samsung Keyboard (also Firefox for Android) | English | Type on a new line, accept autocorrect | Second character missing with a TypeError, duplicate on autocorrect, cursor reset | 6051, 5371, 5666, plate#4874, plate#1230 and plate#1210 comments | Open | Related | No. Samsung Keyboard needs a Samsung device, and Playwright cannot attach to Firefox over CDP | B |

The ranking weighs four things. Comment and reaction counts come first. Lost or duplicated text ranks above caret faults. Recent reports and repeated issues in one family count more. Plate features that depend on the path (toolbar marks, mentions, autoformat) count more. Pre-rewrite issues (before PR 4988, July 2022) count as history, not current evidence.

## 2. Which cases compose on Gboard

| Input | Composes against Slate or Plite? | Evidence | Grade |
| --- | --- | --- | --- |
| Gboard Korean (2-bulsik) | Yes. A device trace in PR 6096 shows `compositionstart`, then `compositionupdate` for `ㅇ`, `아`, `안`, `안ㄴ`, `안녀` | PR 6096 comments, 5989, 5493 | B |
| Gboard Japanese romaji | Yes. The underline under `h` shows an active composition | 5883 (Gboard 14.2) | B |
| Gboard Chinese Pinyin | Yes | 5984 names Gboard Chinese. PR 6096 names pinyin | B |
| Handwriting IMEs | Yes for Sogou. Gboard handwriting is untested | 5979 | B for Sogou, guess for Gboard |
| SwiftKey English | Yes. Slate keeps a compat branch for SwiftKey's `insertCompositionText` after mark placeholders | `android-input-manager.ts:648` (A), 5643 (B) | A |
| Samsung Keyboard English | Sometimes. Suggestion replacement arrives as `insertCompositionText` | 5371 | B |
| Gboard English, tapped letters | Disputed. Maintainer BitPhinix (2022) says Android IMEs open a composition session for almost every input. 5019 (Gboard 11.7) loses the last word because it is still composing. A 5493 commenter recorded the double-letter bug while composing English. PR 6096 (2026) says Gboard English autocorrect breaks the same way. The probe on API 36, Chrome 146 and current Gboard saw per-letter `insertText` with no composition. The probe page set no `spellCheck` or `autoCorrect` (A, `apps/www/src/registry/components/editor/editor.tsx`), and the strip showed word candidates | 5078, 5019, 5493, PR 6096 (B); probe shard (C) | B and C conflict |
| Gboard English glide, suggestion tap, autocorrect, caret placed back into a word | Unknown. Each may use composition or `insertReplacementText` | 5371 says most IMEs replace through `insertCompositionText` | guess |
| Voice dictation | Unknown. Partial results probably stream as composing text, which would explain the repeat in 5983 | 5983 | guess |

So the lane composes for certain only through Gboard Korean, Japanese or Pinyin. Each costs one language download on a Play image. SwiftKey from the Play Store is the likely English composing keyboard (guess, untested on this emulator).

Before trusting any English case, run a census. It is one cheap run that settles whether English composes in this setup.

1. Use the same emulator and the same Gboard on four pages. The pages are a plain `<textarea>`, a bare `<div contenteditable>` on a `data:` URL, slatejs.org's rich text example (stock Slate with its Android manager), and a Plite editor.
2. On each page, type `hello world` by taps, glide one word, tap one suggestion, trigger one autocorrect and tap back into a finished word. Record `compositionstart`, `compositionupdate`, `compositionend` and every `beforeinput.inputType`.
3. Read the result. If the textarea and bare contenteditable compose but Plite does not, Plite's Android path pushes Gboard out of composing mode. That would be a bug lead in its own right (guess). If none of the four compose, current Gboard simply commits per letter in Chrome 146, and English composition coverage must come from SwiftKey or a physical device.
4. Repeat with Gboard auto-correction, the suggestion strip and glide typing toggled. These are the settings most likely to matter (guess).

## 3. Mapping the 16 raw-mobile scenarios

`RAW_MOBILE_SCENARIOS` (A, `packages/test/src/proof/raw-mobile-proof.ts:7-24`) has 11 selection or gesture rows with `updateCount: 0` and 5 editing rows. None names marks, suggestions, autocorrect, triggers or pending input, which are ranks 2 to 7 above. The single `composition-ime` row is too coarse, because ranks 1, 6 and 7 fail in three different ways under composition.

| Raw scenario | Decision | Ranked case | Reason |
| --- | --- | --- | --- |
| `tap` | Keep | S10 | It is the precondition for every case. Assert keyboard shown and model caret equal to the native caret |
| `double-tap` | Merge | S10 | Double-tap word selection then type-over. Little separate Android pain |
| `long-press` | Merge | S10, S12 | Long-press selects a word and opens the paste menu used by S12 |
| `selection-handle-forward` | Merge with backward, defer | S10 | The main pain (3470) predates the rewrite. One handle-drag case covers both directions |
| `selection-handle-backward` | Merge with forward, defer | S10 | Same as above |
| `cross-inline-selection` | Merge | S5 | Selecting across a mention and deleting is the inline-boundary case |
| `cross-block-text-selection` | Keep, second slice | S10, S8 | Slate `android-tests#remove` selects across blocks and backspaces |
| `selection-autoscroll` | Keep, second slice | S10 | Matches 5291, caret jump in a tall block |
| `swipe-collapsed` | Drop from the Android slice | none | `updateCount: 0` means a page swipe, not glide typing (inferred). No Android issue signal. Keep as a later no-op guard |
| `swipe-expanded` | Drop, merge with `swipe-collapsed` | none | Same as above |
| `inline-void-boundary` | Keep | S5 | Ranked fifth. Add the keyboard-visible oracle |
| `enter` | Keep, specify | S9 | Name the positions. They are mid-word, at a mark boundary, at a link end and after a composing word |
| `backspace` | Keep, specify | S8 | Name hold-repeat, block join, empty block and after Pinyin composition |
| `autocapitalization` | Merge | S3 | 5084 and 5891 both concern the first line after the placeholder. The probe saw capitalization work once (C) |
| `composition-ime` | Split | S1, S6, S7 | First character in an empty leaf, a tap during composition and an external action during composition |
| `native-clipboard` | Keep, second slice | S12 | Fixed upstream. Lower pain |

The receipt schema also blocks emulator receipts. It requires `directAppium: true` and `device.realDevice: true` (A, `raw-mobile-proof.ts:66-68`, `:179`). The review record already replaces `directAppium` with a transport field (C). It also needs a device-kind field, or emulator runs can never write a valid receipt.

## 4. Minimum first slice

Six cases, all on the stock Play emulator. They cover ranks 1 to 7 and six distinct failure modes. Each case asserts five things after every step. DOM text equals model text. The model caret equals the native caret. The keyboard is still shown (guess for the mechanism, for example `adb shell dumpsys input_method` reporting the input view shown). The console has no errors. The event trace is captured, including whether composition fired. `verify` asks for five warm runs on native input (C, probe shard).

| Order | Case | Setup | Oracle | Failure mode it isolates | Issues |
| --- | --- | --- | --- | --- | --- |
| 1 | Korean first syllable in an empty paragraph with the placeholder visible, then a second syllable, then Enter | Gboard Korean 2-bulsik | Model `안녕` with no stray jamo. `compositionstart` present. Caret at offset 2, then in the new block | Composition lifecycle in an empty leaf, where flush, RestoreDOM or a re-render replaces the composing node | 5493, 5989, 4693, 5883, plate#3250, PR 6096 |
| 2 | Type `hel` after a bold leaf and tap a strip candidate | Gboard English, strip on. Candidate position from a screenshot or a UI dump | Exactly one word, no duplicated prefix, caret at the word end, bold leaf unchanged | Candidate replacement of existing text | 5643, 5130, 4602, 5371, 4550 |
| 3 | In an empty editor, type `cant`, press space, type `go` | Gboard English, auto-correction on | `Can't go` (or the corrected form), caret after `go`, no no-op correction | Automatic replacement at the placeholder-to-content transition, plus autocapitalization | 5891, 5892, Slate `android-tests#autocorrect` |
| 4 | Collapsed caret, tap toolbar Bold, type `ab`, then `c` | Gboard English | Keyboard still shown. `abc` in one bold leaf. Caret at offset 3 in that leaf | Mark placeholder and keyboard dismissal | 6022, PR 6027, Plate gate in `2026-05-23-plite-android-mark-toggle-no-appium-proof.md` |
| 5 | Type `@bi`, tap an option, type ` x`, then backspace three times across the mention. Repeat the query in Korean so the tap happens during composition | Gboard English and Korean, mention demo | One mention node, no multiplied text, keyboard shown throughout, caret beside the mention | Inline boundary plus a combobox tap during composition | plate#1230, 5680, 5357, 5052, 5540, autocomplete Android-taps gate |
| 6 | Compose a Korean word without committing, then tap a toolbar block-type button | Gboard Korean | The word survives in the model, the block type applies and no line disappears | Pending-input flush when a toolbar action starts | 5019, 4861, 5078, 5893 |

Second slice in priority order. First, hold-backspace across blocks and Pinyin backspace (S8). Next, Enter at mark and link boundaries with soft-keyboard Enter (S9). Then caret by tap in a tall block with long-press type-over (S10), markdown shortcuts (S11) and glide typing (S13). Enter and Backspace sit lower because the Appium keycode lane already proved the structural rows. Gboard sends Enter and Delete as key events, so a keycode exercises the same path except for repeat and composition interplay (inferred).

## 5. What an emulator cannot cover

- Samsung Keyboard and Samsung Internet need a Samsung device (6051, 5371, plate#4874, Samsung comments on plate#1230).
- Firefox for Android installs, but Playwright cannot attach to it over CDP. That excludes 5130 (14c 3r), 6051 and 5666.
- A physical keyboard on a phone is a separate input path (plate#4874).
- Slow-phone timing races are hidden on a fast host. 4714 and 4715 went away on faster phones. CDP CPU throttling may approximate them (guess).
- Voice dictation needs host audio and speech services. The probe booted with `-no-audio`.
- OEM WebViews and in-app browsers are out of reach. The 6022 reporter used a WebView app. A stock emulator can host a debuggable WebView app over the same CDP forward (guess), but not OEM variants.
- Physical-device Gboard behavior may differ from the emulator build, which is the open question in section 2.
- The raw-mobile schema's `realDevice: true` requirement fails for every emulator receipt.

## 6. Upstream coverage worth reusing

Slate's manual `android-tests` page (A, `site/examples/ts/android-tests.tsx`) has six cases. They are split-join, insertion (taps, glide, voice, IME), special (mid-word Enter, space and backspace in `mid|dle`, caps then `It me. No.`), empty, remove and autocorrect. Plate ported it to `apps/www/src/app/(app)/examples/plite/_examples/android-tests.tsx` (A). The first slice can open those routes directly for cases 3 and 9. Slate's Android-specific branches show which inputs Android sends in unusual shapes (A, `android-input-manager.ts`):

- placeholder FEFF removal (line 605)
- the Android clipboard's trailing newline (line 611)
- the SwiftKey target-range off-by-one after a mark placeholder (line 648)
- line-break deletion target ranges
- forced actions when a text leaf empties
- RestoreDOM skipping `characterData` mutations so composition survives (`restore-dom-manager.ts:38`)
